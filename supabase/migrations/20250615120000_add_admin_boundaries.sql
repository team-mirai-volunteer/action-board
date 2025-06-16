-- PostGIS拡張を有効化
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 行政区域境界データを保存するテーブル
CREATE TABLE admin_boundaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prefecture_code VARCHAR(5) NOT NULL, -- N03_007
    prefecture_name VARCHAR(10) NOT NULL, -- N03_001
    city_name VARCHAR(50), -- N03_002
    district_name VARCHAR(50), -- N03_003
    area_name VARCHAR(50), -- N03_004
    additional_code VARCHAR(10), -- N03_005
    full_address VARCHAR(200) NOT NULL, -- 完全な住所
    geojson JSONB NOT NULL, -- GeoJSONの地理情報
    geometry GEOMETRY(MULTIPOLYGON, 4326), -- PostGISジオメトリ（WGS84）
    properties JSONB, -- その他のプロパティ
    is_merged BOOLEAN DEFAULT FALSE, -- マージされたデータかどうか
    original_count INTEGER DEFAULT 1, -- 元のポリゴン数
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- インデックスを作成
CREATE INDEX idx_admin_boundaries_prefecture_code ON admin_boundaries(prefecture_code);
CREATE INDEX idx_admin_boundaries_prefecture_name ON admin_boundaries(prefecture_name);
CREATE INDEX idx_admin_boundaries_city_name ON admin_boundaries(city_name);
CREATE INDEX idx_admin_boundaries_full_address ON admin_boundaries(full_address);
CREATE INDEX idx_admin_boundaries_geojson ON admin_boundaries USING GIN(geojson);
CREATE INDEX idx_admin_boundaries_geometry ON admin_boundaries USING GIST(geometry);
CREATE INDEX idx_admin_boundaries_is_merged ON admin_boundaries(is_merged);

-- 住所検索用のGINインデックス
CREATE INDEX idx_admin_boundaries_full_address_trgm ON admin_boundaries USING GIN(full_address gin_trgm_ops);

-- 一意制約（マージ後は同じ行政区域で複数レコードを防ぐ）
-- prefecture_name, city_name, district_nameで統合
CREATE UNIQUE INDEX idx_admin_boundaries_unique_merged 
ON admin_boundaries(prefecture_name, COALESCE(city_name, ''), COALESCE(district_name, '')) 
WHERE is_merged = true;

-- GeoJSONからジオメトリを生成する関数
CREATE OR REPLACE FUNCTION update_geometry_from_geojson()
RETURNS TRIGGER AS $$
BEGIN
    -- GeoJSONからPostGISジオメトリを生成
    NEW.geometry := ST_SetSRID(ST_GeomFromGeoJSON(NEW.geojson::text), 4326);
    
    -- MultiPolygonでない場合は変換
    IF ST_GeometryType(NEW.geometry) = 'ST_Polygon' THEN
        NEW.geometry := ST_Multi(NEW.geometry);
    END IF;
    
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを作成
CREATE TRIGGER trigger_update_geometry
    BEFORE INSERT OR UPDATE ON admin_boundaries
    FOR EACH ROW
    EXECUTE FUNCTION update_geometry_from_geojson();

-- 同じ行政区域のポリゴンをマージする関数
CREATE OR REPLACE FUNCTION merge_admin_boundaries_by_area()
RETURNS INTEGER AS $$
DECLARE
    merged_count INTEGER := 0;
    rec RECORD;
    merged_geometry GEOMETRY;
    merged_geojson JSONB;
    total_count INTEGER;
BEGIN
    -- 既存のマージデータを削除
    DELETE FROM admin_boundaries WHERE is_merged = true;
    
    -- 同じ行政区域でグループ化してマージ（prefecture_name, city_name, district_nameで統合）
    FOR rec IN 
        SELECT 
            prefecture_code,
            prefecture_name,
            city_name,
            district_name,
            -- area_nameとadditional_codeは最初の値を使用
            MIN(area_name) as area_name,
            MIN(additional_code) as additional_code,
            -- full_addressも再構築
            prefecture_name || COALESCE(city_name, '') || COALESCE(district_name, '') as base_address,
            COUNT(*) as polygon_count
        FROM admin_boundaries 
        WHERE is_merged = false
        GROUP BY prefecture_code, prefecture_name, city_name, district_name
        HAVING COUNT(*) > 1
    LOOP
        -- ジオメトリをマージ
        SELECT ST_Union(geometry), COUNT(*)
        INTO merged_geometry, total_count
        FROM admin_boundaries 
        WHERE prefecture_code = rec.prefecture_code
            AND prefecture_name = rec.prefecture_name
            AND COALESCE(city_name, '') = COALESCE(rec.city_name, '')
            AND COALESCE(district_name, '') = COALESCE(rec.district_name, '')
            AND is_merged = false;
        
        -- MultiPolygonに変換
        IF ST_GeometryType(merged_geometry) = 'ST_Polygon' THEN
            merged_geometry := ST_Multi(merged_geometry);
        END IF;
        
        -- GeoJSONに変換
        merged_geojson := ST_AsGeoJSON(merged_geometry)::JSONB;
        
        -- マージされたデータを挿入
        INSERT INTO admin_boundaries (
            prefecture_code,
            prefecture_name,
            city_name,
            district_name,
            area_name,
            additional_code,
            full_address,
            geojson,
            geometry,
            is_merged,
            original_count
        ) VALUES (
            rec.prefecture_code,
            rec.prefecture_name,
            rec.city_name,
            rec.district_name,
            rec.area_name,
            rec.additional_code,
            rec.prefecture_name || COALESCE(rec.city_name, '') || COALESCE(rec.district_name, ''),
            merged_geojson,
            merged_geometry,
            true,
            total_count
        );
        
        merged_count := merged_count + 1;
    END LOOP;
    
    RETURN merged_count;
END;
$$ LANGUAGE plpgsql;

-- マージされていない境界データを取得するビュー
CREATE VIEW view_admin_boundaries_merged AS
SELECT 
    id,
    prefecture_code,
    prefecture_name,
    city_name,
    district_name,
    area_name,
    additional_code,
    full_address,
    geojson,
    geometry,
    properties,
    is_merged,
    original_count,
    created_at,
    updated_at
FROM admin_boundaries
WHERE (
    -- マージされたデータを優先
    is_merged = true
    OR (
        -- マージされていない場合は、同じ区域で重複がないもの（prefecture_name, city_name, district_nameで判定）
        is_merged = false 
        AND NOT EXISTS (
            SELECT 1 FROM admin_boundaries ab2 
            WHERE ab2.is_merged = true
                AND ab2.prefecture_name = admin_boundaries.prefecture_name
                AND COALESCE(ab2.city_name, '') = COALESCE(admin_boundaries.city_name, '')
                AND COALESCE(ab2.district_name, '') = COALESCE(admin_boundaries.district_name, '')
        )
    )
);

COMMENT ON TABLE admin_boundaries IS '行政区域境界データ（国土地理院のN03データ）';
COMMENT ON COLUMN admin_boundaries.prefecture_code IS '都道府県コード（N03_007）';
COMMENT ON COLUMN admin_boundaries.prefecture_name IS '都道府県名（N03_001）';
COMMENT ON COLUMN admin_boundaries.city_name IS '市区町村名（N03_002）';
COMMENT ON COLUMN admin_boundaries.district_name IS '郡・政令市区名（N03_003）';
COMMENT ON COLUMN admin_boundaries.area_name IS '行政区域名（N03_004）';
COMMENT ON COLUMN admin_boundaries.additional_code IS '追加コード（N03_005）';
COMMENT ON COLUMN admin_boundaries.full_address IS '完全な住所（検索用）';
COMMENT ON COLUMN admin_boundaries.geojson IS 'GeoJSON形式の地理情報';
COMMENT ON COLUMN admin_boundaries.properties IS 'その他のプロパティ情報';
COMMENT ON COLUMN admin_boundaries.geometry IS 'PostGISジオメトリ（WGS84座標系）';
COMMENT ON COLUMN admin_boundaries.is_merged IS 'マージされたポリゴンかどうか';
COMMENT ON COLUMN admin_boundaries.original_count IS 'マージ前の元のポリゴン数';
COMMENT ON VIEW view_admin_boundaries_merged IS '重複排除された行政区域境界データ';
COMMENT ON FUNCTION merge_admin_boundaries_by_area() IS '同じ行政区域の複数ポリゴンをマージする関数';

-- RLS設定
ALTER TABLE admin_boundaries ENABLE ROW LEVEL SECURITY;

-- すべてのユーザーが読み取り可能（匿名含む）
CREATE POLICY select_all_admin_boundaries
  ON admin_boundaries FOR SELECT
  USING (true);

-- 管理者のみが挿入・更新・削除可能（一般的にはデータのインポート時のみ）
-- 実際の運用では、専用のサービスアカウントなどを使用してデータをインポートする

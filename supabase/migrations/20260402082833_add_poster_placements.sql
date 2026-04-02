-- ポスター掲示テーブルの追加
-- ボランティアがポスター掲示を報告・記録するためのテーブル

-- ==============================================
-- Part 1: poster_placements テーブル
-- ==============================================

CREATE TABLE poster_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  prefecture TEXT,
  city TEXT,
  address TEXT,
  postcode TEXT,
  count INTEGER NOT NULL DEFAULT 1,
  mission_artifact_id UUID REFERENCES mission_artifacts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE poster_placements IS 'ポスター掲示の報告レコード';
COMMENT ON COLUMN poster_placements.user_id IS '報告者のユーザーID';
COMMENT ON COLUMN poster_placements.lat IS '掲示場所の緯度';
COMMENT ON COLUMN poster_placements.lng IS '掲示場所の経度';
COMMENT ON COLUMN poster_placements.prefecture IS '都道府県（逆ジオコーディング）';
COMMENT ON COLUMN poster_placements.city IS '市区町村（逆ジオコーディング）';
COMMENT ON COLUMN poster_placements.address IS '住所（逆ジオコーディング）';
COMMENT ON COLUMN poster_placements.postcode IS '郵便番号（逆ジオコーディング）';
COMMENT ON COLUMN poster_placements.count IS '掲示したポスターの枚数';
COMMENT ON COLUMN poster_placements.mission_artifact_id IS 'ミッション連携用の成果物ID';

-- インデックス
CREATE INDEX idx_poster_placements_user_id ON poster_placements(user_id);
CREATE INDEX idx_poster_placements_prefecture_city ON poster_placements(prefecture, city);
CREATE INDEX idx_poster_placements_created_at ON poster_placements(created_at DESC);

-- ==============================================
-- Part 2: RLS ポリシー
-- ==============================================

ALTER TABLE poster_placements ENABLE ROW LEVEL SECURITY;

-- SELECT: 本人のみ閲覧可能
CREATE POLICY "Users can view their own poster placements"
  ON poster_placements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: 認証済みユーザーが自分のレコードを作成
CREATE POLICY "Authenticated users can create poster placements"
  ON poster_placements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: 本人のみ更新可能
CREATE POLICY "Users can update their own poster placements"
  ON poster_placements
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: 本人のみ削除可能
CREATE POLICY "Users can delete their own poster placements"
  ON poster_placements
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==============================================
-- Part 3: poster_placement_city_stats 集計ビュー
-- ==============================================

CREATE VIEW poster_placement_city_stats AS
SELECT
  prefecture,
  city,
  SUM(count) AS total_count,
  COUNT(*) AS placement_count
FROM poster_placements
WHERE prefecture IS NOT NULL AND city IS NOT NULL
GROUP BY prefecture, city;

COMMENT ON VIEW poster_placement_city_stats IS '市区町村レベルのポスター掲示集計（個人情報を含まない）';

-- ビューへの SELECT を認証済みユーザーに許可
-- ビューは元テーブルの RLS をバイパスするため、security_invoker を設定
ALTER VIEW poster_placement_city_stats SET (security_invoker = true);

-- ただし service_role（createAdminClient）経由でクエリするため、
-- RLS バイパスで全レコードを集計できる。
-- 認証ユーザーが直接ビューにアクセスする場合は自分のデータしか集計されない点に注意。

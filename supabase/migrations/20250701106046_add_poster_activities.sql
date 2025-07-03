-- ポスター活動テーブルの追加

-- 1. ポスター活動専用データテーブルの作成
CREATE TABLE poster_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mission_artifact_id UUID NOT NULL REFERENCES mission_artifacts(id) ON DELETE CASCADE,
    
    -- PosterFormの必須項目
    poster_count INTEGER NOT NULL CHECK (poster_count > 0),
    prefecture poster_prefecture_enum NOT NULL,
    city TEXT NOT NULL CHECK (LENGTH(city) <= 100),
    number TEXT NOT NULL CHECK (LENGTH(number) <= 20),
    
    -- PosterFormのオプショナル項目
    name TEXT CHECK (LENGTH(name) <= 100),
    note TEXT CHECK (LENGTH(note) <= 200),
    address TEXT CHECK (LENGTH(address) <= 200),
    lat decimal(10, 8),
    long decimal(11, 8),
    
    -- システム項目
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE poster_activities IS 'ポスター活動の詳細情報';
COMMENT ON COLUMN poster_activities.id IS 'ポスター活動ID';
COMMENT ON COLUMN poster_activities.user_id IS 'ユーザーID';
COMMENT ON COLUMN poster_activities.mission_artifact_id IS '関連する成果物のID';
COMMENT ON COLUMN poster_activities.poster_count IS 'ポスター枚数';
COMMENT ON COLUMN poster_activities.prefecture IS '都道府県';
COMMENT ON COLUMN poster_activities.city IS '市町村＋区';
COMMENT ON COLUMN poster_activities.number IS '番号（例：10-1、27-2）';
COMMENT ON COLUMN poster_activities.name IS 'ポスター掲示板の名前・目印（例：東小学校前）';
COMMENT ON COLUMN poster_activities.note IS 'ポスター掲示板の特記事項（例：破損していました）';
COMMENT ON COLUMN poster_activities.address IS '詳細住所';
COMMENT ON COLUMN poster_activities.lat IS 'ポスター掲示板の緯度';
COMMENT ON COLUMN poster_activities.long IS 'ポスター掲示板の経度';
COMMENT ON COLUMN poster_activities.created_at IS '記録日時(UTC)';
COMMENT ON COLUMN poster_activities.updated_at IS '更新日時(UTC)';

-- 2. インデックスの作成
CREATE INDEX idx_poster_activities_user_id ON poster_activities(user_id);
CREATE INDEX idx_poster_activities_mission_artifact_id ON poster_activities(mission_artifact_id);
CREATE INDEX idx_poster_activities_created_at ON poster_activities(created_at);
CREATE INDEX idx_poster_activities_prefecture ON poster_activities(prefecture);
CREATE INDEX idx_poster_activities_city ON poster_activities(city);

-- 3. RLS設定
ALTER TABLE poster_activities ENABLE ROW LEVEL SECURITY;

-- ポスター活動は作成者のみが閲覧・管理可能
CREATE POLICY "Users can manage their own poster activities"
  ON poster_activities
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

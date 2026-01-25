-- TikTok動画とその統計情報を保存するテーブル
-- ユーザーが連携したTikTokアカウントの#チームみらい動画を管理

-- tiktok_videos テーブル
CREATE TABLE tiktok_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id VARCHAR UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- 登録したユーザー
  creator_id VARCHAR NOT NULL,           -- TikTokクリエイターID
  creator_username VARCHAR,
  title VARCHAR,
  description TEXT,
  thumbnail_url VARCHAR,
  video_url VARCHAR NOT NULL,
  published_at TIMESTAMPTZ,
  duration INTEGER,                      -- 秒単位
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- tiktok_video_stats テーブル（日次統計スナップショット）
CREATE TABLE tiktok_video_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tiktok_video_id UUID REFERENCES tiktok_videos(id) ON DELETE CASCADE,
  recorded_at DATE NOT NULL,
  view_count BIGINT,
  like_count BIGINT,
  comment_count BIGINT,
  share_count BIGINT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tiktok_video_id, recorded_at)
);

-- インデックス
CREATE INDEX idx_tiktok_videos_video_id ON tiktok_videos(video_id);
CREATE INDEX idx_tiktok_videos_user_id ON tiktok_videos(user_id);
CREATE INDEX idx_tiktok_videos_published_at ON tiktok_videos(published_at DESC);
CREATE INDEX idx_tiktok_video_stats_video_date ON tiktok_video_stats(tiktok_video_id, recorded_at DESC);

-- RLSポリシー（読み取りのみ許可、書き込みはservice_roleのみ）
ALTER TABLE tiktok_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiktok_video_stats ENABLE ROW LEVEL SECURITY;

-- tiktok_videos: 認証済みユーザーは読み取りのみ
CREATE POLICY "Allow read for authenticated users" ON tiktok_videos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read for anon users" ON tiktok_videos
  FOR SELECT TO anon USING (true);

-- tiktok_video_stats: 認証済みユーザーは読み取りのみ
CREATE POLICY "Allow read for authenticated users" ON tiktok_video_stats
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read for anon users" ON tiktok_video_stats
  FOR SELECT TO anon USING (true);

-- 書き込み（INSERT/UPDATE/DELETE）はservice_roleのみ
-- RLSはservice_roleをバイパスするため、ポリシー追加不要

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_tiktok_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tiktok_videos_updated_at
  BEFORE UPDATE ON tiktok_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_tiktok_videos_updated_at();

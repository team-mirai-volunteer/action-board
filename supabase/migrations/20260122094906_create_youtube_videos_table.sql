-- YouTube動画のマスターデータを保存するテーブル
CREATE TABLE youtube_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id VARCHAR UNIQUE NOT NULL,        -- YouTube動画ID
  title VARCHAR NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR,
  channel_id VARCHAR NOT NULL,
  channel_title VARCHAR,
  published_at TIMESTAMPTZ,
  duration VARCHAR,                        -- ISO 8601形式 (PT1H2M3S)
  tags TEXT[],                             -- タグ配列
  is_active BOOLEAN DEFAULT true,          -- 削除/非公開検知用
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- インデックス
CREATE INDEX idx_youtube_videos_video_id ON youtube_videos(video_id);
CREATE INDEX idx_youtube_videos_published_at ON youtube_videos(published_at DESC);

-- YouTube動画の日毎統計スナップショットを保存するテーブル
CREATE TABLE youtube_video_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_video_id UUID REFERENCES youtube_videos(id) ON DELETE CASCADE,
  recorded_at DATE NOT NULL,               -- 記録日
  view_count BIGINT,
  like_count BIGINT,
  comment_count BIGINT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(youtube_video_id, recorded_at)    -- 1日1レコード
);

-- インデックス
CREATE INDEX idx_youtube_video_stats_video_date ON youtube_video_stats(youtube_video_id, recorded_at DESC);

-- RLSを有効化
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_video_stats ENABLE ROW LEVEL SECURITY;

-- youtube_videos: 全員が閲覧可能（認証済みユーザー）
CREATE POLICY "youtube_videos_select_policy" ON youtube_videos
  FOR SELECT TO authenticated
  USING (true);

-- youtube_video_stats: 全員が閲覧可能（認証済みユーザー）
CREATE POLICY "youtube_video_stats_select_policy" ON youtube_video_stats
  FOR SELECT TO authenticated
  USING (true);

-- service_roleのみINSERT/UPDATE/DELETE可能（バッチ処理用）
-- RLSはservice_roleをバイパスするため、明示的なポリシーは不要

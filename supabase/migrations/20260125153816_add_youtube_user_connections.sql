-- YouTubeユーザー連携情報を保存するテーブル
CREATE TABLE youtube_user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_user_id VARCHAR NOT NULL,
  channel_id VARCHAR NOT NULL,           -- ユーザーのYouTubeチャンネルID（JOINで使用）
  display_name VARCHAR,
  avatar_url VARCHAR,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- インデックス
CREATE INDEX idx_youtube_user_connections_user_id ON youtube_user_connections(user_id);
CREATE INDEX idx_youtube_user_connections_channel_id ON youtube_user_connections(channel_id);

-- RLSを有効化
ALTER TABLE youtube_user_connections ENABLE ROW LEVEL SECURITY;

-- service_roleのみアクセス可能（トークン情報を含むため）

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_youtube_user_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_youtube_user_connections_updated_at
  BEFORE UPDATE ON youtube_user_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_youtube_user_connections_updated_at();

-- 同一Googleアカウント/チャンネルの重複連携防止
ALTER TABLE youtube_user_connections
ADD CONSTRAINT youtube_user_connections_google_user_id_unique UNIQUE (google_user_id);

ALTER TABLE youtube_user_connections
ADD CONSTRAINT youtube_user_connections_channel_id_unique UNIQUE (channel_id);

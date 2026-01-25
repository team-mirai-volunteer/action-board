-- TikTokユーザー連携情報を保存するテーブル
-- トークン情報を含むため、service_roleのみアクセス可能

CREATE TABLE tiktok_user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tiktok_open_id VARCHAR NOT NULL,
  tiktok_union_id VARCHAR,
  display_name VARCHAR,
  avatar_url VARCHAR,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  refresh_token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- インデックス
CREATE INDEX idx_tiktok_user_connections_user_id ON tiktok_user_connections(user_id);
CREATE INDEX idx_tiktok_user_connections_tiktok_open_id ON tiktok_user_connections(tiktok_open_id);

-- RLSを有効化（デフォルトですべて拒否）
ALTER TABLE tiktok_user_connections ENABLE ROW LEVEL SECURITY;

-- service_roleのみアクセス可能（RLSをバイパス）
-- 通常ユーザーはServer Actions経由でのみアクセス

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_tiktok_user_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tiktok_user_connections_updated_at
  BEFORE UPDATE ON tiktok_user_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_tiktok_user_connections_updated_at();

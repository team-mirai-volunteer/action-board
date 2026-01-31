-- youtube_sync_status テーブルにRLSを有効化
-- ユーザーには一切アクセスを許可しない（service_roleのみ操作可能）
ALTER TABLE youtube_sync_status ENABLE ROW LEVEL SECURITY;

-- ポリシーを作成しないことで、全ユーザーに対してアクセスを拒否
-- service_role は RLS をバイパスするため、Server Action からは操作可能

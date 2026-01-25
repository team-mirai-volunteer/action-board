-- tiktok_open_idにユニーク制約を追加
-- 同じTikTokアカウントを複数のユーザーが連携できないようにする
ALTER TABLE tiktok_user_connections
ADD CONSTRAINT tiktok_user_connections_tiktok_open_id_unique UNIQUE (tiktok_open_id);

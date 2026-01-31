-- youtube_videos に comments_synced_at カラムを追加
ALTER TABLE youtube_videos
ADD COLUMN comments_synced_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN youtube_videos.comments_synced_at IS '動画のコメント同期の最終実行日時（API呼び出しレート制限用）';

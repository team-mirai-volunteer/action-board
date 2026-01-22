-- video_url カラムを追加
ALTER TABLE youtube_videos ADD COLUMN video_url VARCHAR;

-- 既存データのvideo_urlを生成
UPDATE youtube_videos SET video_url = 'https://www.youtube.com/watch?v=' || video_id;

-- NOT NULL制約を追加
ALTER TABLE youtube_videos ALTER COLUMN video_url SET NOT NULL;

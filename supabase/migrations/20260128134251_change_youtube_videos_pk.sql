-- youtube_videosスキーマ変更: video_idをPRIMARY KEYに
-- Issue #1833

-- ==============================================
-- Part 1: youtube_video_statsの外部キーを移行
-- ==============================================

-- 1-1. youtube_video_statsの外部キー制約を一時削除
ALTER TABLE youtube_video_stats DROP CONSTRAINT IF EXISTS youtube_video_stats_youtube_video_id_fkey;

-- 1-2. youtube_video_statsにvideo_idカラムを追加（データ移行用）
ALTER TABLE youtube_video_stats ADD COLUMN video_id VARCHAR;

-- 1-3. 既存データのvideo_idを移行
UPDATE youtube_video_stats AS s
SET video_id = v.video_id
FROM youtube_videos AS v
WHERE s.youtube_video_id = v.id;

-- 1-4. youtube_video_statsの旧カラムを削除
ALTER TABLE youtube_video_stats DROP COLUMN youtube_video_id;

-- ==============================================
-- Part 2: youtube_videosのPKを変更
-- ==============================================

-- 2-1. youtube_videosのUNIQUE制約を削除（PKに変更するため）
ALTER TABLE youtube_videos DROP CONSTRAINT IF EXISTS youtube_videos_video_id_key;

-- 2-2. youtube_videos: idを削除してvideo_idをPKに
ALTER TABLE youtube_videos DROP CONSTRAINT youtube_videos_pkey;
ALTER TABLE youtube_videos DROP COLUMN id;
ALTER TABLE youtube_videos ADD PRIMARY KEY (video_id);

-- 2-3. video_idのインデックスを削除（PKなので不要）
DROP INDEX IF EXISTS idx_youtube_videos_video_id;

-- ==============================================
-- Part 3: youtube_video_statsの外部キーを再設定
-- ==============================================

-- 3-1. video_idをNOT NULLに
ALTER TABLE youtube_video_stats ALTER COLUMN video_id SET NOT NULL;

-- 3-2. 外部キー制約を再設定
ALTER TABLE youtube_video_stats ADD CONSTRAINT youtube_video_stats_video_id_fkey
  FOREIGN KEY (video_id) REFERENCES youtube_videos(video_id) ON DELETE CASCADE;

-- 3-3. UNIQUE制約を更新
ALTER TABLE youtube_video_stats DROP CONSTRAINT IF EXISTS youtube_video_stats_youtube_video_id_recorded_at_key;
ALTER TABLE youtube_video_stats ADD CONSTRAINT youtube_video_stats_video_id_recorded_at_key
  UNIQUE(video_id, recorded_at);

-- 3-4. インデックスを更新
DROP INDEX IF EXISTS idx_youtube_video_stats_video_date;
CREATE INDEX idx_youtube_video_stats_video_date ON youtube_video_stats(video_id, recorded_at DESC);

-- 既存のYouTube URLを含むmission_artifactsに対してyoutube_video_likesを作成
-- link_urlからvideo_idを抽出し、youtube_videosに存在するもののみinsert
-- 注: 過去のYouTubeミッションはartifact_type='LINK'で登録されている

INSERT INTO youtube_video_likes (user_id, video_id, mission_artifact_id, detected_at, created_at)
SELECT
  extracted.user_id,
  extracted.video_id,
  extracted.mission_artifact_id,
  extracted.detected_at,
  extracted.created_at
FROM (
  SELECT
    ma.user_id,
    -- YouTube URLからvideo_idを抽出
    -- パターン1: youtube.com/watch?v=VIDEO_ID
    -- パターン2: youtu.be/VIDEO_ID
    -- パターン3: youtube.com/shorts/VIDEO_ID
    -- パターン4: youtube.com/live/VIDEO_ID
    CASE
      WHEN ma.link_url LIKE '%youtube.com/watch?v=%' THEN
        SUBSTRING(ma.link_url FROM 'youtube\.com/watch\?v=([a-zA-Z0-9_-]+)')
      WHEN ma.link_url LIKE '%youtu.be/%' THEN
        SUBSTRING(ma.link_url FROM 'youtu\.be/([a-zA-Z0-9_-]+)')
      WHEN ma.link_url LIKE '%youtube.com/shorts/%' THEN
        SUBSTRING(ma.link_url FROM 'youtube\.com/shorts/([a-zA-Z0-9_-]+)')
      WHEN ma.link_url LIKE '%youtube.com/live/%' THEN
        SUBSTRING(ma.link_url FROM 'youtube\.com/live/([a-zA-Z0-9_-]+)')
      ELSE NULL
    END AS video_id,
    ma.id AS mission_artifact_id,
    ma.created_at AS detected_at,
    ma.created_at
  FROM mission_artifacts ma
  WHERE ma.link_url IS NOT NULL
    AND (
      ma.link_url LIKE '%youtube.com/watch?v=%'
      OR ma.link_url LIKE '%youtu.be/%'
      OR ma.link_url LIKE '%youtube.com/shorts/%'
      OR ma.link_url LIKE '%youtube.com/live/%'
    )
) AS extracted
-- youtube_videosに存在するvideo_idのみ
INNER JOIN youtube_videos yv ON yv.video_id = extracted.video_id
WHERE extracted.video_id IS NOT NULL
ON CONFLICT (user_id, video_id) DO NOTHING;

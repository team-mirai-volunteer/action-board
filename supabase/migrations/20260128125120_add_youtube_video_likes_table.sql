-- YouTubeいいねミッション自動クリア機能のためのマイグレーション

-- 1. youtube_video_likesテーブルを作成（重複達成防止用）
CREATE TABLE youtube_video_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id VARCHAR NOT NULL,
  youtube_video_id UUID REFERENCES youtube_videos(id) ON DELETE SET NULL,
  is_team_mirai_video BOOLEAN NOT NULL DEFAULT false,
  detected_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, video_id)
);

CREATE INDEX idx_youtube_video_likes_user_id ON youtube_video_likes(user_id);
CREATE INDEX idx_youtube_video_likes_video_id ON youtube_video_likes(video_id);

-- 2. RLSを有効化
ALTER TABLE youtube_video_likes ENABLE ROW LEVEL SECURITY;

-- 3. RLSポリシーを作成
CREATE POLICY "Users can view own likes" ON youtube_video_likes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage likes" ON youtube_video_likes
  FOR ALL USING (true);

-- 4. mission_artifactsテーブルのartifact_typeにYOUTUBE_LIKEを追加
ALTER TABLE public.mission_artifacts
DROP CONSTRAINT check_artifact_type;

ALTER TABLE public.mission_artifacts
ADD CONSTRAINT check_artifact_type CHECK (
  artifact_type = ANY (
    ARRAY[
      'LINK'::text,
      'TEXT'::text,
      'EMAIL'::text,
      'IMAGE'::text,
      'IMAGE_WITH_GEOLOCATION'::text,
      'REFERRAL'::text,
      'POSTING'::text,
      'YOUTUBE_LIKE'::text  -- 新規追加
    ]
  )
);

-- 5. ensure_artifact_dataを更新してYOUTUBE_LIKEタイプを追加
ALTER TABLE public.mission_artifacts
DROP CONSTRAINT ensure_artifact_data;

ALTER TABLE public.mission_artifacts
ADD CONSTRAINT ensure_artifact_data CHECK (
  (
    (
      (artifact_type = 'LINK'::text)
      AND (link_url IS NOT NULL)
      AND (image_storage_path IS NULL)
      AND (text_content IS NULL)
    )
    OR (
      (artifact_type = 'TEXT'::text)
      AND (text_content IS NOT NULL)
      AND (link_url IS NULL)
      AND (image_storage_path IS NULL)
    )
    OR (
      (artifact_type = 'EMAIL'::text)
      AND (text_content IS NOT NULL)
      AND (link_url IS NULL)
      AND (image_storage_path IS NULL)
    )
    OR (
      (artifact_type = 'IMAGE'::text)
      AND (image_storage_path IS NOT NULL)
      AND (link_url IS NULL)
      AND (text_content IS NULL)
    )
    OR (
      (artifact_type = 'IMAGE_WITH_GEOLOCATION'::text)
      AND (image_storage_path IS NOT NULL)
      AND (link_url IS NULL)
      AND (text_content IS NULL)
    )
    OR (
      (artifact_type = 'REFERRAL'::text)
      AND (link_url IS NULL)
      AND (image_storage_path IS NULL)
      AND (text_content IS NOT NULL)
    )
    OR (
      (artifact_type = 'POSTING'::text)
      AND (link_url IS NULL)
      AND (image_storage_path IS NULL)
      AND (text_content IS NOT NULL)
    )
    OR (
      (artifact_type = 'YOUTUBE_LIKE'::text)
      AND (link_url IS NOT NULL)
      AND (image_storage_path IS NULL)
      AND (text_content IS NULL)
    )
  )
);

-- YouTubeミッション機能の追加
-- Issue #1834

-- ==============================================
-- Part 1: artifact_type制約にYOUTUBEを追加
-- ==============================================

ALTER TABLE mission_artifacts
DROP CONSTRAINT IF EXISTS check_artifact_type;

ALTER TABLE mission_artifacts
ADD CONSTRAINT check_artifact_type
CHECK (artifact_type IN ('LINK', 'TEXT', 'EMAIL', 'IMAGE', 'IMAGE_WITH_GEOLOCATION', 'REFERRAL', 'POSTING', 'POSTER', 'QUIZ', 'LINK_ACCESS', 'YOUTUBE'));

-- ==============================================
-- Part 2: ensure_artifact_data制約にYOUTUBEを追加
-- YOUTUBEはLINKと同じパターン（link_urlに動画URLを保存）
-- ==============================================

ALTER TABLE mission_artifacts
DROP CONSTRAINT IF EXISTS ensure_artifact_data;

ALTER TABLE mission_artifacts
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
      (artifact_type = 'POSTER'::text)
      AND (link_url IS NULL)
      AND (image_storage_path IS NULL)
      AND (text_content IS NOT NULL)
    )
    OR (
      (artifact_type = 'QUIZ'::text)
      AND (link_url IS NULL)
      AND (image_storage_path IS NULL)
      AND (text_content IS NULL)
    )
    OR (
      (artifact_type = 'LINK_ACCESS'::text)
      AND (link_url IS NULL)
      AND (image_storage_path IS NULL)
      AND (text_content IS NULL)
    )
    OR (
      (artifact_type = 'YOUTUBE'::text)
      AND (link_url IS NOT NULL)
      AND (image_storage_path IS NULL)
      AND (text_content IS NULL)
    )
  )
);

-- ==============================================
-- Part 3: youtube_video_likesテーブル作成
-- ==============================================

CREATE TABLE youtube_video_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id VARCHAR NOT NULL REFERENCES youtube_videos(video_id) ON DELETE SET NULL,
  mission_artifact_id UUID NOT NULL REFERENCES mission_artifacts(id) ON DELETE CASCADE,
  detected_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, video_id)
);

COMMENT ON TABLE youtube_video_likes IS 'YouTubeいいねによるミッション達成記録';
COMMENT ON COLUMN youtube_video_likes.id IS 'レコードID';
COMMENT ON COLUMN youtube_video_likes.user_id IS 'ユーザーID';
COMMENT ON COLUMN youtube_video_likes.video_id IS 'YouTube動画ID（youtube_videos.video_idへの外部キー）';
COMMENT ON COLUMN youtube_video_likes.mission_artifact_id IS '関連する成果物のID';
COMMENT ON COLUMN youtube_video_likes.detected_at IS 'いいね検出日時';
COMMENT ON COLUMN youtube_video_likes.created_at IS '記録作成日時';

-- インデックス
CREATE INDEX idx_youtube_video_likes_user_id ON youtube_video_likes(user_id);
CREATE INDEX idx_youtube_video_likes_video_id ON youtube_video_likes(video_id);
CREATE INDEX idx_youtube_video_likes_mission_artifact_id ON youtube_video_likes(mission_artifact_id);

-- ==============================================
-- Part 4: RLS設定
-- ==============================================

ALTER TABLE youtube_video_likes ENABLE ROW LEVEL SECURITY;

-- 自分のいいね記録のみ閲覧可能
CREATE POLICY "Users can view their own youtube video likes"
  ON youtube_video_likes
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = (
      SELECT ma.user_id FROM mission_artifacts ma WHERE ma.id = mission_artifact_id
    )
  );

-- 操作は作成者のみ（mission_artifactsのuser_idで判定）
CREATE POLICY "Users can manage their own youtube video likes"
  ON youtube_video_likes
  FOR ALL
  USING (
    auth.uid() = (
      SELECT ma.user_id FROM mission_artifacts ma WHERE ma.id = mission_artifact_id
    )
  )
  WITH CHECK (
    auth.uid() = (
      SELECT ma.user_id FROM mission_artifacts ma WHERE ma.id = mission_artifact_id
    )
  );

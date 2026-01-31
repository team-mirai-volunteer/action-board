-- YouTubeコメント自動同期機能の追加
-- Issue #1872

-- ==============================================
-- Part 1: artifact_type制約にYOUTUBE_COMMENTを追加
-- ==============================================

ALTER TABLE mission_artifacts
DROP CONSTRAINT IF EXISTS check_artifact_type;

ALTER TABLE mission_artifacts
ADD CONSTRAINT check_artifact_type
CHECK (artifact_type IN ('LINK', 'TEXT', 'EMAIL', 'IMAGE', 'IMAGE_WITH_GEOLOCATION', 'REFERRAL', 'POSTING', 'POSTER', 'QUIZ', 'LINK_ACCESS', 'YOUTUBE', 'YOUTUBE_COMMENT'));

-- ==============================================
-- Part 2: ensure_artifact_data制約にYOUTUBE_COMMENTを追加
-- YOUTUBE_COMMENTはYOUTUBEと同じパターン（link_urlにコメントURLを保存）
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
    OR (
      (artifact_type = 'YOUTUBE_COMMENT'::text)
      AND (link_url IS NOT NULL)
      AND (image_storage_path IS NULL)
      AND (text_content IS NULL)
    )
  )
);

-- ==============================================
-- Part 3: youtube_video_comments（コメントキャッシュ）
-- 全コメントを保存し、差分同期に使用
-- ==============================================

CREATE TABLE youtube_video_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id VARCHAR NOT NULL REFERENCES youtube_videos(video_id) ON DELETE CASCADE,
  comment_id VARCHAR NOT NULL UNIQUE,
  author_channel_id VARCHAR NOT NULL,
  author_display_name VARCHAR,
  text_display TEXT,
  text_original TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE youtube_video_comments IS 'YouTube動画のコメントキャッシュ（API呼び出し削減用）';
COMMENT ON COLUMN youtube_video_comments.video_id IS 'YouTube動画ID（youtube_videos.video_idへの外部キー）';
COMMENT ON COLUMN youtube_video_comments.comment_id IS 'YouTubeコメントID（ユニーク）';
COMMENT ON COLUMN youtube_video_comments.author_channel_id IS 'コメント投稿者のYouTubeチャンネルID';
COMMENT ON COLUMN youtube_video_comments.author_display_name IS 'コメント投稿者の表示名';
COMMENT ON COLUMN youtube_video_comments.text_display IS 'コメント本文（HTML形式）';
COMMENT ON COLUMN youtube_video_comments.text_original IS 'コメント本文（プレーンテキスト）';
COMMENT ON COLUMN youtube_video_comments.published_at IS 'コメント投稿日時（差分同期に使用）';

-- インデックス
CREATE INDEX idx_youtube_video_comments_video_id ON youtube_video_comments(video_id);
CREATE INDEX idx_youtube_video_comments_author_channel_id ON youtube_video_comments(author_channel_id);
CREATE INDEX idx_youtube_video_comments_published_at ON youtube_video_comments(published_at DESC);

-- RLS: service_roleのみ書き込み、認証ユーザーは読み取り可能
ALTER TABLE youtube_video_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view comments"
  ON youtube_video_comments
  FOR SELECT
  TO authenticated
  USING (true);

-- ==============================================
-- Part 4: youtube_user_comments（ユーザーのミッション達成記録）
-- ==============================================

CREATE TABLE youtube_user_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id VARCHAR NOT NULL REFERENCES youtube_videos(video_id),
  comment_id VARCHAR NOT NULL REFERENCES youtube_video_comments(comment_id),
  mission_artifact_id UUID NOT NULL REFERENCES mission_artifacts(id) ON DELETE CASCADE,
  detected_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, comment_id)
);

COMMENT ON TABLE youtube_user_comments IS 'ユーザーのYouTubeコメントによるミッション達成記録';
COMMENT ON COLUMN youtube_user_comments.user_id IS 'ユーザーID';
COMMENT ON COLUMN youtube_user_comments.video_id IS 'YouTube動画ID';
COMMENT ON COLUMN youtube_user_comments.comment_id IS 'YouTubeコメントID（youtube_video_comments.comment_idへの外部キー）';
COMMENT ON COLUMN youtube_user_comments.mission_artifact_id IS '関連する成果物のID';
COMMENT ON COLUMN youtube_user_comments.detected_at IS 'コメント検出日時';

-- インデックス
CREATE INDEX idx_youtube_user_comments_user_id ON youtube_user_comments(user_id);
CREATE INDEX idx_youtube_user_comments_video_id ON youtube_user_comments(video_id);

-- RLS設定
ALTER TABLE youtube_user_comments ENABLE ROW LEVEL SECURITY;

-- SELECT: 自分のコメント記録のみ閲覧可能
CREATE POLICY "Users can view their own youtube comments"
  ON youtube_user_comments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: service_roleのみ（バッチ処理・Server Actions経由）
-- 認証ユーザーからの直接insertは不可

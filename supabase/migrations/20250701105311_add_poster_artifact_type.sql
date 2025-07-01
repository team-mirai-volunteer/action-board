-- POSTERアーティファクトタイプを追加するマイグレーション

-- mission_artifactsテーブルのartifact_type制約を更新してPOSTERを追加
ALTER TABLE mission_artifacts
DROP CONSTRAINT IF EXISTS check_artifact_type;

ALTER TABLE mission_artifacts
ADD CONSTRAINT check_artifact_type
CHECK (artifact_type IN ('LINK', 'TEXT', 'EMAIL', 'IMAGE', 'IMAGE_WITH_GEOLOCATION', 'REFERRAL', 'POSTING', 'POSTER', 'QUIZ', 'LINK_ACCESS'));

-- ensure_artifact_data制約にPOSTERタイプを追加
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
  )
);

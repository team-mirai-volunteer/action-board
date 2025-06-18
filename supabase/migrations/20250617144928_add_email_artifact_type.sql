-- EMAIL成果物タイプをサポートするためのマイグレーション

-- 1. mission_artifactsテーブルのartifact_typeにEMAILを追加
ALTER TABLE public.mission_artifacts
DROP CONSTRAINT check_artifact_type;

ALTER TABLE public.mission_artifacts
ADD CONSTRAINT check_artifact_type CHECK (
  artifact_type = ANY (
    ARRAY[
      'LINK'::text,
      'TEXT'::text,
      'EMAIL'::text,  -- 新規追加
      'IMAGE'::text,
      'IMAGE_WITH_GEOLOCATION'::text,
      'REFERRAL'::text,
      'POSTING'::text
    ]
  )
);

-- 2. ensure_artifact_dataを更新してEMAILタイプを追加
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
  )
);


-- 3. missionsテーブルの既存のレコードのrequired_artifact_typeを更新
UPDATE missions SET
    required_artifact_type = 'EMAIL'
WHERE title = 'サポーターSlackに入ろう';

-- 4. missionsテーブルのrequired_artifact_typeコメントを更新
COMMENT ON COLUMN missions.required_artifact_type IS 'ミッション達成に必要な成果物の種類 (LINK, TEXT, EMAIL, IMAGE, NONE)';
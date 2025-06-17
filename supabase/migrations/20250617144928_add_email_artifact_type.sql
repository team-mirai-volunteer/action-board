-- EMAIL成果物タイプをサポートするためのマイグレーション

-- artifact_typeのチェック制約を更新してEMAILタイプを追加
ALTER TABLE mission_artifacts DROP CONSTRAINT check_artifact_type;
ALTER TABLE mission_artifacts ADD CONSTRAINT check_artifact_type 
    CHECK (artifact_type IN ('LINK', 'TEXT', 'EMAIL', 'IMAGE', 'IMAGE_WITH_GEOLOCATION'));

-- ensure_link_or_image制約を更新してEMAILタイプを含める
ALTER TABLE mission_artifacts DROP CONSTRAINT ensure_artifact_data;
ALTER TABLE mission_artifacts ADD CONSTRAINT ensure_artifact_data CHECK (
    (artifact_type = 'LINK' AND link_url IS NOT NULL AND image_storage_path IS NULL AND text_content IS NULL) OR
    (artifact_type = 'TEXT' AND text_content IS NOT NULL AND link_url IS NULL AND image_storage_path IS NULL) OR
    (artifact_type = 'EMAIL' AND text_content IS NOT NULL AND link_url IS NULL AND image_storage_path IS NULL) OR
    (artifact_type = 'IMAGE' AND image_storage_path IS NOT NULL AND link_url IS NULL AND text_content IS NULL) OR
    (artifact_type = 'IMAGE_WITH_GEOLOCATION' AND image_storage_path IS NOT NULL AND link_url IS NULL AND text_content IS NULL)
);

-- missionsテーブルの既存のレコードのrequired_artifact_typeを更新
UPDATE missions SET
    required_artifact_type = 'EMAIL'
WHERE title = 'サポーターSlackに入ろう';

-- missionsテーブルのrequired_artifact_typeコメントを更新
COMMENT ON COLUMN missions.required_artifact_type IS 'ミッション達成に必要な成果物の種類 (LINK, TEXT, EMAIL, IMAGE, NONE)';
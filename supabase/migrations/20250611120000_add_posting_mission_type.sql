-- ポスティングミッション機能の追加

-- 1. mission_artifactsテーブルのartifact_typeにPOSTINGを追加
ALTER TABLE public.mission_artifacts
DROP CONSTRAINT check_artifact_type;

ALTER TABLE public.mission_artifacts
ADD CONSTRAINT check_artifact_type CHECK (
  artifact_type = ANY (
    ARRAY[
      'LINK'::text,
      'TEXT'::text,
      'IMAGE'::text,
      'IMAGE_WITH_GEOLOCATION'::text,
      'REFERRAL'::text,
      'POSTING'::text  -- 新規追加
    ]
  )
);

-- 2. ensure_artifact_dataを更新してPOSTINGタイプを追加
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

-- 3. ポスティング専用データテーブルの作成
CREATE TABLE posting_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_artifact_id UUID NOT NULL REFERENCES mission_artifacts(id) ON DELETE CASCADE,
    posting_count INTEGER NOT NULL CHECK (posting_count > 0),
    location_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE posting_activities IS 'ポスティング活動の詳細情報';
COMMENT ON COLUMN posting_activities.id IS 'ポスティング活動ID';
COMMENT ON COLUMN posting_activities.mission_artifact_id IS '関連する成果物のID';
COMMENT ON COLUMN posting_activities.posting_count IS 'ポスティングした枚数';
COMMENT ON COLUMN posting_activities.location_text IS 'ポスティング場所（例：東京都世田谷区代田1丁目）';
COMMENT ON COLUMN posting_activities.created_at IS '記録日時(UTC)';
COMMENT ON COLUMN posting_activities.updated_at IS '更新日時(UTC)';

-- 4. インデックスの作成
CREATE INDEX idx_posting_activities_mission_artifact_id ON posting_activities(mission_artifact_id);
CREATE INDEX idx_posting_activities_created_at ON posting_activities(created_at);

-- 5. RLS設定
ALTER TABLE posting_activities ENABLE ROW LEVEL SECURITY;

-- ポスティング活動は作成者のみが閲覧・管理可能
CREATE POLICY "Users can manage their own posting activities"
  ON posting_activities
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



-- 9. ポスティングミッションのサンプル追加
INSERT INTO missions (
    id, 
    title, 
    content, 
    difficulty, 
    required_artifact_type, 
    max_achievement_count,
    artifact_label,
    icon_url,
    ogp_image_url
) VALUES (
    gen_random_uuid(),
    'チームはやまの機関誌をポスティングしよう',
    'チームはやまの機関誌を地域に配布してください。ポスティングした枚数と場所を報告してください。配布1枚につき5ポイントを獲得できます。',
    2, -- 難易度2（Normal）
    'POSTING',
    NULL, -- 無制限（何度でも達成可能）
    'ポスティング情報',
    '/img/mission_fallback.svg',
    'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp/15_post_institutional_magazine.png'
);

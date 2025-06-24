-- Add slug column to mission_category table
ALTER TABLE mission_category ADD COLUMN slug TEXT;

-- Add unique constraint to slug
ALTER TABLE mission_category ADD CONSTRAINT mission_category_slug_unique UNIQUE (slug);

-- Update existing mission categories with slugs
UPDATE mission_category SET slug = CASE
  WHEN id = '0cc2f4f9-ab0a-480c-c1e2-442513421dfc' THEN 'learn-about-teammirai'
  WHEN id = '8b36a669-3457-0b67-308b-b4b8b0a3356d' THEN 'follow-teammirai'
  WHEN id = 'e8e9652f-bd9e-e726-918e-6ef914432f85' THEN 'join-community'
  WHEN id = '504a2520-23e3-e49b-e3f8-9e97981a1d03' THEN 'support-with-likes'
  WHEN id = '07f654ee-d1da-328b-2443-fefa3c8d3a47' THEN 'share-and-spread'
  WHEN id = 'b2109f3b-2389-54e0-0cb9-2dcb4e421994' THEN 'local-activities'
  WHEN id = '720b511c-8be3-8e0c-e2ae-d95be1613281' THEN 'learn-with-quiz'
  WHEN id = '19bb0960-86af-4162-2351-530f664ac5b5' THEN 'improve-policies'
  WHEN id = '373fe78b-9e63-96f7-40af-650120a599f1' THEN 'support-on-youtube'
  WHEN id = '91a10bef-fab0-1a99-c8d5-4353cd39c402' THEN 'support-on-tiktok'
  WHEN id = '089ed58c-9bbc-fb5d-8b51-e608906a965c' THEN 'support-on-x'
  WHEN id = '6d4a5924-5411-277c-9c7d-911df2b717a1' THEN 'support-on-note'
  WHEN id = 'cb1da45e-740d-5ad9-55e8-40cb5c8446e1' THEN 'create-and-support'
  ELSE NULL
END
WHERE slug IS NULL;

-- Make slug column NOT NULL after updating all existing records
ALTER TABLE mission_category ALTER COLUMN slug SET NOT NULL;

-- Create index on slug for better query performance
CREATE INDEX idx_mission_category_slug ON mission_category(slug);
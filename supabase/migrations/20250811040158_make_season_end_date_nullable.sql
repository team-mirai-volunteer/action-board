-- Make season end_date nullable and update season2

-- 1. Make end_date column nullable
ALTER TABLE seasons ALTER COLUMN end_date DROP NOT NULL;

-- 2. Update season2 to have null end_date (ongoing season)
UPDATE seasons 
SET end_date = NULL 
WHERE slug = 'season2';
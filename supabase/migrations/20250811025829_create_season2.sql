-- Create Season 2

-- First, set season1 to inactive
UPDATE seasons SET is_active = false WHERE slug = 'season1';

-- Create season2 with start date 2025-08-13 00:00:00 JST
INSERT INTO seasons (slug, name, start_date, end_date, is_active)
VALUES (
  'season2', 
  '2025夏~', 
  '2025-08-13 00:00:00+09', 
  '2030-12-31 23:59:59+09', -- Set far future date as placeholder
  true
)
ON CONFLICT (slug) DO UPDATE SET
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  is_active = EXCLUDED.is_active;
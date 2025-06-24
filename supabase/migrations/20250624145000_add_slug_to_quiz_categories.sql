-- Add slug column to quiz_categories table
ALTER TABLE quiz_categories ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_categories_slug ON quiz_categories(slug);

-- Update existing quiz categories with slugs
UPDATE quiz_categories SET slug = 'teammirai' WHERE name = 'チームみらい';
UPDATE quiz_categories SET slug = 'policy' WHERE name = '政策・マニフェスト';

-- Make slug column NOT NULL after populating data
ALTER TABLE quiz_categories ALTER COLUMN slug SET NOT NULL;
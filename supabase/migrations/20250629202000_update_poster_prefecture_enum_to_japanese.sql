-- Drop the old enum type and recreate with Japanese prefecture names
-- First, we need to handle the existing data

-- Step 1: Add a temporary column to store the prefecture as text
ALTER TABLE poster_boards ADD COLUMN prefecture_temp text;

-- Step 2: Map existing English values to Japanese
UPDATE poster_boards
SET prefecture_temp = CASE prefecture
  WHEN 'hokkaido' THEN '北海道'
  WHEN 'miyagi' THEN '宮城県'
  WHEN 'saitama' THEN '埼玉県'
  WHEN 'chiba' THEN '千葉県'
  WHEN 'tokyo' THEN '東京都'
  WHEN 'kanagawa' THEN '神奈川県'
  WHEN 'nagano' THEN '長野県'
  WHEN 'aichi' THEN '愛知県'
  WHEN 'osaka' THEN '大阪府'
  WHEN 'hyogo' THEN '兵庫県'
  WHEN 'ehime' THEN '愛媛県'
  WHEN 'fukuoka' THEN '福岡県'
  ELSE prefecture::text
END;

-- Step 3: Drop the old column and constraints
ALTER TABLE poster_boards DROP CONSTRAINT poster_boards_unique;
ALTER TABLE poster_boards DROP COLUMN prefecture;

-- Step 4: Drop the old enum type
DROP TYPE poster_prefecture_enum;

-- Step 5: Create new enum type with Japanese prefecture names (only the 12 we need)
CREATE TYPE poster_prefecture_enum AS ENUM (
  '北海道',
  '宮城県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '長野県',
  '愛知県',
  '大阪府',
  '兵庫県',
  '愛媛県',
  '福岡県'
);

-- Step 6: Add the prefecture column back with the new enum type
ALTER TABLE poster_boards ADD COLUMN prefecture poster_prefecture_enum;

-- Step 7: Copy data from temporary column to new column
UPDATE poster_boards SET prefecture = prefecture_temp::poster_prefecture_enum;

-- Step 8: Make prefecture NOT NULL
ALTER TABLE poster_boards ALTER COLUMN prefecture SET NOT NULL;

-- Step 9: Drop the temporary column
ALTER TABLE poster_boards DROP COLUMN prefecture_temp;

-- Step 10: Recreate the unique constraint
ALTER TABLE poster_boards ADD CONSTRAINT poster_boards_unique UNIQUE(prefecture, city, number);

-- Step 11: Recreate the index
CREATE INDEX idx_poster_boards_prefecture ON poster_boards(prefecture);
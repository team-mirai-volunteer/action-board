-- Drop all unique constraints on poster_boards table
ALTER TABLE poster_boards DROP CONSTRAINT IF EXISTS poster_boards_prefecture_city_number_key;
ALTER TABLE poster_boards DROP CONSTRAINT IF EXISTS poster_boards_unique;

-- Drop the unique constraint on staging_poster_boards table if it exists
ALTER TABLE staging_poster_boards DROP CONSTRAINT IF EXISTS staging_poster_boards_prefecture_city_number_key;

-- Add comment explaining why these constraints were removed
COMMENT ON TABLE poster_boards IS 'Poster board locations. No unique constraint on (prefecture, city, number) as the data may contain duplicates.';

-- Remove NOT NULL constraints from poster_boards table
ALTER TABLE poster_boards 
  ALTER COLUMN lat DROP NOT NULL,
  ALTER COLUMN long DROP NOT NULL;

-- Remove NOT NULL constraints from staging_poster_boards table
ALTER TABLE staging_poster_boards 
  ALTER COLUMN lat DROP NOT NULL,
  ALTER COLUMN long DROP NOT NULL;

COMMENT ON COLUMN poster_boards.lat IS 'Board latitude - can be NULL if not available in source data';
COMMENT ON COLUMN poster_boards.long IS 'Board longitude - can be NULL if not available in source data';

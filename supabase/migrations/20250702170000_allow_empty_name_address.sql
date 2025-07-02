-- Allow empty strings for name and address fields in poster_boards and staging_poster_boards tables

-- Remove NOT NULL constraints from poster_boards table
ALTER TABLE poster_boards 
  ALTER COLUMN name DROP NOT NULL,
  ALTER COLUMN address DROP NOT NULL;

-- Remove NOT NULL constraints from staging_poster_boards table
ALTER TABLE staging_poster_boards 
  ALTER COLUMN name DROP NOT NULL,
  ALTER COLUMN address DROP NOT NULL;

-- Add comment explaining the change
COMMENT ON COLUMN poster_boards.name IS 'Board name - can be empty string if not available in source data';
COMMENT ON COLUMN poster_boards.address IS 'Board address - can be empty string if not available in source data';
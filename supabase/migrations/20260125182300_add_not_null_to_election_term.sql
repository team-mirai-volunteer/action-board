-- Add NOT NULL constraint to election_term column
-- Since election_term is now part of the unique constraint, it should never be null

-- First, ensure no NULL values exist (set any remaining NULLs to a default)
-- This handles edge cases where data might have been inserted without election_term
UPDATE poster_boards
SET election_term = 'shugin-2026'
WHERE election_term IS NULL;

-- Add NOT NULL constraint
ALTER TABLE poster_boards
ALTER COLUMN election_term SET NOT NULL;

-- Note: staging_poster_boards does NOT need NOT NULL constraint
-- because election_term is added during INSERT from staging to main table

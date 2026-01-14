-- Add election_term column to poster_boards
ALTER TABLE poster_boards
ADD COLUMN IF NOT EXISTS election_term text;

-- Add election_term column to staging_poster_boards
ALTER TABLE staging_poster_boards
ADD COLUMN IF NOT EXISTS election_term text;

-- Create index for election_term filtering
CREATE INDEX IF NOT EXISTS idx_poster_boards_election_term ON poster_boards(election_term);

-- Set existing archived data (where district IS NULL) to sangin-2025
UPDATE poster_boards
SET election_term = 'sangin-2025'
WHERE district IS NULL AND archived = true AND election_term IS NULL;

-- Set existing active data (where district IS NOT NULL) to shugin-2026
UPDATE poster_boards
SET election_term = 'shugin-2026'
WHERE district IS NOT NULL AND archived = false AND election_term IS NULL;

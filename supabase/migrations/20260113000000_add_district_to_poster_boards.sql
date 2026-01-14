-- Add district column to poster_boards for 衆議院議員選挙 区割り support
ALTER TABLE poster_boards
ADD COLUMN district text;

-- Add district column to staging_poster_boards
ALTER TABLE staging_poster_boards
ADD COLUMN district text;

-- Add index for district filtering
CREATE INDEX idx_poster_boards_district ON poster_boards(district);

-- Add archived flag for old data (to hide prefecture-based data)
ALTER TABLE poster_boards
ADD COLUMN archived boolean DEFAULT false;

-- Add election_term column to poster_boards
ALTER TABLE poster_boards
ADD COLUMN election_term text;

-- Add election_term column to staging_poster_boards
ALTER TABLE staging_poster_boards
ADD COLUMN election_term text;

-- Create index for election_term filtering
CREATE INDEX idx_poster_boards_election_term ON poster_boards(election_term);

-- Archive existing data that doesn't have a district and set election_term
UPDATE poster_boards
SET archived = true, election_term = 'sangin-2025'
WHERE district IS NULL;

-- Set election_term for active data (with district)
UPDATE poster_boards
SET election_term = 'shugin-2026'
WHERE district IS NOT NULL AND archived = false;

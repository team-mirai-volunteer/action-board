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

-- Archive existing data that doesn't have a district
UPDATE poster_boards SET archived = true WHERE district IS NULL;

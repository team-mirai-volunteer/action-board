-- Add address and city columns to poster_boards table
ALTER TABLE poster_boards 
  ADD COLUMN address text,
  ADD COLUMN city text;

-- Rename lon column to long
ALTER TABLE poster_boards 
  RENAME COLUMN lon TO long;

-- Update check constraint for the renamed column
ALTER TABLE poster_boards
  DROP CONSTRAINT chk_lon,
  ADD CONSTRAINT chk_long CHECK (long BETWEEN -180 AND 180);

-- Update index to use the new column name
DROP INDEX idx_poster_boards_lat_lon;
CREATE INDEX idx_poster_boards_lat_long ON poster_boards(lat, long);
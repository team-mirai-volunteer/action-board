-- Add address and city columns to poster_boards table
ALTER TABLE poster_boards 
  ADD COLUMN address text NOT NULL,
  ADD COLUMN city text NOT NULL;

-- Rename lon column to long
ALTER TABLE poster_boards 
  RENAME COLUMN lon TO long;

-- Update check constraint for the renamed column
ALTER TABLE poster_boards
  DROP CONSTRAINT chk_lon,
  ADD CONSTRAINT chk_long CHECK (long BETWEEN -180 AND 180);

-- Rename index to reflect the new column name
ALTER INDEX idx_poster_boards_lat_lon RENAME TO idx_poster_boards_lat_long;
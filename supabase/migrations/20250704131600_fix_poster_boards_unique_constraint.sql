ALTER TABLE poster_boards 
DROP CONSTRAINT IF EXISTS poster_boards_unique_location;

ALTER TABLE poster_boards 
ADD CONSTRAINT poster_boards_row_file_prefecture_unique 
UNIQUE (row_number, file_name, prefecture);

-- Add comment explaining the new constraint
COMMENT ON CONSTRAINT poster_boards_row_file_prefecture_unique ON poster_boards IS 
'Ensures each row from a file is unique per prefecture. Allows overwriting city, number, and address for the same row-file-prefecture combination.';

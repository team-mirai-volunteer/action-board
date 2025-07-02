-- Drop the existing unique constraint on (row_number, file_name)
ALTER TABLE poster_boards 
DROP CONSTRAINT IF EXISTS poster_boards_row_number_file_name_key;

-- Add new unique constraint on (row_number, file_name, prefecture, city, number)
ALTER TABLE poster_boards 
ADD CONSTRAINT poster_boards_unique_location 
UNIQUE (row_number, file_name, prefecture, city, number);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT poster_boards_unique_location ON poster_boards IS 
'Ensures each location (prefecture, city, number) is unique within a file and row number. This allows the same row number to be used for different locations in the same file.';
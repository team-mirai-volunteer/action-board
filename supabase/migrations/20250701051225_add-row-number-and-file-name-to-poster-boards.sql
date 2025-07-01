-- Add row_number and file_name columns to poster_boards table
ALTER TABLE poster_boards 
ADD COLUMN IF NOT EXISTS row_number INTEGER,
ADD COLUMN IF NOT EXISTS file_name TEXT;

-- Add the same columns to staging table
ALTER TABLE staging_poster_boards
ADD COLUMN IF NOT EXISTS row_number INTEGER,
ADD COLUMN IF NOT EXISTS file_name TEXT;

-- Create a unique constraint on (row_number, file_name) to ensure uniqueness
ALTER TABLE poster_boards 
ADD CONSTRAINT poster_boards_row_file_unique UNIQUE (row_number, file_name);

-- Add comment explaining the new columns
COMMENT ON COLUMN poster_boards.row_number IS 'Original row number from the CSV file';
COMMENT ON COLUMN poster_boards.file_name IS 'Source CSV file name';
COMMENT ON CONSTRAINT poster_boards_row_file_unique ON poster_boards IS 'Ensures each row from a file is unique';
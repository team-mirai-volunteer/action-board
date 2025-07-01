-- First, we need to drop the default constraint and update existing data
ALTER TABLE poster_boards ALTER COLUMN status DROP DEFAULT;

-- Update any 'checked' status to 'done' (since we're removing 'checked')
UPDATE poster_boards SET status = 'done' WHERE status = 'checked';
UPDATE poster_board_status_history SET status = 'done' WHERE status = 'checked';

-- Drop the old enum type (this requires recreating the column)
ALTER TABLE poster_boards ALTER COLUMN status TYPE text;
ALTER TABLE poster_board_status_history ALTER COLUMN status TYPE text;

-- Drop the old enum
DROP TYPE poster_board_status;

-- Create the new enum with updated values
CREATE TYPE poster_board_status AS ENUM (
  'not_yet',           -- *¼Ø
  'reserved',          -- ˆ
  'done',              -- Œ† (previously 'posted', renamed to 'done')
  'error_wrong_place', -- ¨éüÝ¹¿ü²:ÞÃ×hŸ›n4@ûj÷LUF	
  'error_damaged',     -- ¨éü·û4	
  'error_wrong_poster',-- ¨éüÖZnÝ¹¿üL¼‰ŒfD‹	
  'other'              -- ]nÖs0’áâk		
);

-- Convert the text columns back to the new enum type
ALTER TABLE poster_boards ALTER COLUMN status TYPE poster_board_status USING status::poster_board_status;
ALTER TABLE poster_board_status_history ALTER COLUMN status TYPE poster_board_status USING status::poster_board_status;

-- Update any 'posted' status to 'done'
UPDATE poster_boards SET status = 'done' WHERE status = 'posted';
UPDATE poster_board_status_history SET status = 'done' WHERE status = 'posted';

-- Update any generic 'error' or 'damaged' status to more specific ones if needed
UPDATE poster_boards SET status = 'error_damaged' WHERE status = 'damaged';
UPDATE poster_board_status_history SET status = 'error_damaged' WHERE status = 'damaged';
UPDATE poster_boards SET status = 'other' WHERE status = 'error';
UPDATE poster_board_status_history SET status = 'other' WHERE status = 'error';

-- Set the default back to 'not_yet'
ALTER TABLE poster_boards ALTER COLUMN status SET DEFAULT 'not_yet';
-- First, we need to drop the default constraint
ALTER TABLE poster_boards ALTER COLUMN status DROP DEFAULT;
ALTER TABLE staging_poster_boards ALTER COLUMN status DROP DEFAULT;

-- Drop the old enum type (this requires recreating the column)
ALTER TABLE poster_boards ALTER COLUMN status TYPE text;
ALTER TABLE poster_board_status_history ALTER COLUMN previous_status TYPE text;
ALTER TABLE poster_board_status_history ALTER COLUMN new_status TYPE text;
ALTER TABLE staging_poster_boards ALTER COLUMN status TYPE text;

-- Drop the old enum
DROP TYPE poster_board_status;

-- Create the new enum with updated values
CREATE TYPE poster_board_status AS ENUM (
  'not_yet',           -- 未着手
  'reserved',          -- 予約済み
  'done',              -- 完了 (previously 'posted', renamed to 'done')
  'error_wrong_place', -- エラー：場所が違う
  'error_damaged',     -- エラー：破損
  'error_wrong_poster',-- エラー：ポスターが違う
  'other'              -- その他
);

-- Update statuses in text format before converting back to enum
UPDATE poster_boards SET status = 'done' WHERE status IN ('posted', 'checked');
UPDATE poster_board_status_history SET previous_status = 'done' WHERE previous_status IN ('posted', 'checked');
UPDATE poster_board_status_history SET new_status = 'done' WHERE new_status IN ('posted', 'checked');
UPDATE staging_poster_boards SET status = 'done' WHERE status IN ('posted', 'checked');
UPDATE poster_boards SET status = 'error_damaged' WHERE status = 'damaged';
UPDATE poster_board_status_history SET previous_status = 'error_damaged' WHERE previous_status = 'damaged';
UPDATE poster_board_status_history SET new_status = 'error_damaged' WHERE new_status = 'damaged';
UPDATE staging_poster_boards SET status = 'error_damaged' WHERE status = 'damaged';
UPDATE poster_boards SET status = 'other' WHERE status = 'error';
UPDATE poster_board_status_history SET previous_status = 'other' WHERE previous_status = 'error';
UPDATE poster_board_status_history SET new_status = 'other' WHERE new_status = 'error';
UPDATE staging_poster_boards SET status = 'other' WHERE status = 'error';

-- Convert the text columns back to the new enum type
ALTER TABLE poster_boards ALTER COLUMN status TYPE poster_board_status USING status::poster_board_status;
ALTER TABLE poster_board_status_history ALTER COLUMN previous_status TYPE poster_board_status USING previous_status::poster_board_status;
ALTER TABLE poster_board_status_history ALTER COLUMN new_status TYPE poster_board_status USING new_status::poster_board_status;
ALTER TABLE staging_poster_boards ALTER COLUMN status TYPE poster_board_status USING status::poster_board_status;

-- Set the default back to 'not_yet'
ALTER TABLE poster_boards ALTER COLUMN status SET DEFAULT 'not_yet';
ALTER TABLE staging_poster_boards ALTER COLUMN status SET DEFAULT 'not_yet';
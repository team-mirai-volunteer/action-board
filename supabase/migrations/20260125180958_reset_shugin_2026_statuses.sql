-- One-time fix: Reset shugin-2026 statuses to 'not_yet'
--
-- Background: When shugin-2026 data was initially loaded, the old unique constraint
-- (row_number, file_name, prefecture) caused conflicts with sangin-2025 data.
-- This resulted in shugin-2026 records incorrectly inheriting 'done' statuses
-- from the previous election.
--
-- This migration resets all shugin-2026 statuses to 'not_yet' so users can
-- start fresh with the new election data.

UPDATE poster_boards
SET
  status = 'not_yet',
  updated_at = timezone('utc'::text, now())
WHERE election_term = 'shugin-2026'
  AND archived = false;

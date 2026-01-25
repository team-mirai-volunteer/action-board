-- Add election_term to unique constraint
-- This allows each election to have separate records for the same physical location
-- e.g., sangin-2025 and shugin-2026 can have different rows for the same poster board

-- Drop existing constraint
ALTER TABLE poster_boards
DROP CONSTRAINT IF EXISTS poster_boards_row_file_prefecture_unique;

-- Add new constraint with election_term
-- This ensures uniqueness per election, allowing same location to exist in multiple elections
ALTER TABLE poster_boards
ADD CONSTRAINT poster_boards_row_file_prefecture_election_unique
UNIQUE (row_number, file_name, prefecture, election_term);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT poster_boards_row_file_prefecture_election_unique ON poster_boards IS
'Ensures each poster board location is unique within an election term. Allows the same physical location to have separate records across different elections (e.g., sangin-2025 vs shugin-2026).';

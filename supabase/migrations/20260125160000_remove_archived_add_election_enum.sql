-- Remove archived column and convert election_term to election enum
-- The archived column is redundant since it's derived from election_term

-- =========================================================================
-- 1. Create election enum type
-- =========================================================================
CREATE TYPE election_type AS ENUM ('sangin-2025', 'shugin-2026');

-- =========================================================================
-- 2. Drop dependent views and functions that reference 'archived'
-- =========================================================================

-- Drop functions that depend on the view first
DROP FUNCTION IF EXISTS get_user_edited_boards_by_prefecture(poster_prefecture_enum, uuid);
DROP FUNCTION IF EXISTS get_user_edited_boards_with_details(poster_prefecture_enum, uuid);

-- Drop the view
DROP VIEW IF EXISTS poster_board_latest_editors;

-- Drop the archived stats function
DROP FUNCTION IF EXISTS get_archived_poster_board_stats(text);

-- Drop functions that filter by archived
DROP FUNCTION IF EXISTS get_poster_board_stats();
DROP FUNCTION IF EXISTS get_poster_board_stats_optimized(poster_prefecture_enum);

-- =========================================================================
-- 3. Drop indexes on archived column
-- =========================================================================
DROP INDEX IF EXISTS idx_poster_boards_archived_election_term;

-- =========================================================================
-- 4. Add election column as enum, migrate data, then drop old columns
-- =========================================================================

-- Add new election column
ALTER TABLE poster_boards
ADD COLUMN election election_type;

-- Migrate data from election_term to election
UPDATE poster_boards
SET election = election_term::election_type
WHERE election_term IS NOT NULL;

-- Add election column to staging table
ALTER TABLE staging_poster_boards
ADD COLUMN election election_type;

-- Now drop archived and election_term columns
ALTER TABLE poster_boards
DROP COLUMN archived;

ALTER TABLE poster_boards
DROP COLUMN election_term;

ALTER TABLE staging_poster_boards
DROP COLUMN election_term;

-- =========================================================================
-- 5. Create index on election column
-- =========================================================================
CREATE INDEX idx_poster_boards_election ON poster_boards(election);

-- =========================================================================
-- 6. Recreate the view without archived column
-- =========================================================================
CREATE VIEW poster_board_latest_editors AS
WITH latest_history AS (
  SELECT DISTINCT ON (board_id)
    board_id,
    user_id,
    created_at,
    new_status,
    previous_status
  FROM poster_board_status_history
  ORDER BY board_id, created_at DESC
)
SELECT
  pb.id AS board_id,
  pb.prefecture,
  pb.district,
  pb.election,
  pb.lat,
  pb.long,
  pb.status,
  lh.user_id AS last_editor_id,
  lh.created_at AS last_edited_at,
  lh.new_status,
  lh.previous_status
FROM poster_boards pb
LEFT JOIN latest_history lh ON pb.id = lh.board_id;

-- Grant permissions on the view
GRANT SELECT ON poster_board_latest_editors TO authenticated, anon;

-- =========================================================================
-- 7. Recreate functions using election instead of archived
-- =========================================================================

-- Function to get poster board stats (active election only)
CREATE OR REPLACE FUNCTION get_poster_board_stats()
RETURNS TABLE (
  prefecture text,
  status poster_board_status,
  count bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    prefecture::text,
    status,
    COUNT(*)::bigint as count
  FROM poster_boards
  WHERE prefecture IS NOT NULL
    AND lat IS NOT NULL
    AND long IS NOT NULL
    AND election = 'shugin-2026'  -- Active election
  GROUP BY prefecture, status
  ORDER BY prefecture, status;
$$;

-- Optimized stats function for a specific prefecture
CREATE OR REPLACE FUNCTION get_poster_board_stats_optimized(
  target_prefecture poster_prefecture_enum
)
RETURNS TABLE(
  total_count bigint,
  status_counts jsonb
)
LANGUAGE sql
STABLE
AS $$
  WITH status_summary AS (
    SELECT
      COUNT(*) FILTER (WHERE status = 'not_yet') AS not_yet_count,
      COUNT(*) FILTER (WHERE status = 'not_yet_dangerous') AS not_yet_dangerous_count,
      COUNT(*) FILTER (WHERE status = 'reserved') AS reserved_count,
      COUNT(*) FILTER (WHERE status = 'done') AS done_count,
      COUNT(*) FILTER (WHERE status = 'error_wrong_place') AS error_wrong_place_count,
      COUNT(*) FILTER (WHERE status = 'error_damaged') AS error_damaged_count,
      COUNT(*) FILTER (WHERE status = 'error_wrong_poster') AS error_wrong_poster_count,
      COUNT(*) FILTER (WHERE status = 'other') AS other_count,
      COUNT(*) AS total
    FROM poster_boards
    WHERE prefecture = target_prefecture
      AND lat IS NOT NULL
      AND long IS NOT NULL
      AND election = 'shugin-2026'  -- Active election
  )
  SELECT
    total,
    jsonb_build_object(
      'not_yet', not_yet_count,
      'not_yet_dangerous', not_yet_dangerous_count,
      'reserved', reserved_count,
      'done', done_count,
      'error_wrong_place', error_wrong_place_count,
      'error_damaged', error_damaged_count,
      'error_wrong_poster', error_wrong_poster_count,
      'other', other_count
    )
  FROM status_summary;
$$;

-- Function to get user edited boards by prefecture
CREATE OR REPLACE FUNCTION get_user_edited_boards_by_prefecture(
  target_prefecture poster_prefecture_enum,
  target_user_id uuid
)
RETURNS TABLE(board_id uuid)
LANGUAGE sql
STABLE
AS $$
  SELECT board_id
  FROM poster_board_latest_editors
  WHERE prefecture = target_prefecture
    AND last_editor_id = target_user_id
    AND election = 'shugin-2026'  -- Active election
  ORDER BY last_edited_at DESC;
$$;

-- Function to get user edited boards with details
CREATE OR REPLACE FUNCTION get_user_edited_boards_with_details(
  target_prefecture poster_prefecture_enum,
  target_user_id uuid
)
RETURNS TABLE(
  board_id uuid,
  lat double precision,
  long double precision,
  status poster_board_status,
  last_edited_at timestamp with time zone
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    board_id,
    lat,
    long,
    status,
    last_edited_at
  FROM poster_board_latest_editors
  WHERE prefecture = target_prefecture
    AND last_editor_id = target_user_id
    AND election = 'shugin-2026'  -- Active election
  ORDER BY last_edited_at DESC;
$$;

-- Function to get archived (past election) poster board stats
CREATE OR REPLACE FUNCTION get_archived_poster_board_stats(p_election election_type)
RETURNS TABLE (
  prefecture text,
  status poster_board_status,
  count bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    prefecture::text,
    status,
    COUNT(*)::bigint as count
  FROM poster_boards
  WHERE prefecture IS NOT NULL
    AND election = p_election
  GROUP BY prefecture, status
  ORDER BY prefecture, status;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_poster_board_stats() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_poster_board_stats_optimized(poster_prefecture_enum) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_edited_boards_by_prefecture(poster_prefecture_enum, uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_edited_boards_with_details(poster_prefecture_enum, uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_archived_poster_board_stats(election_type) TO authenticated, anon;

-- Fix poster board functions to filter by archived=false
-- This ensures only active (shuin-2026) data is returned, not archived (sangin-2025) data

-- =============================================================================
-- 1. Fix get_poster_board_stats()
-- =============================================================================
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
    AND archived = false  -- Only include active (non-archived) boards
  GROUP BY prefecture, status
  ORDER BY prefecture, status;
$$;

-- =============================================================================
-- 2. Fix get_poster_board_stats_optimized()
-- =============================================================================
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
      AND archived = false  -- Only include active (non-archived) boards
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

-- =============================================================================
-- 3. Fix get_user_edited_boards_by_prefecture()
-- =============================================================================
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
    AND archived = false  -- Only include active (non-archived) boards
  ORDER BY last_edited_at DESC;
$$;

-- =============================================================================
-- 4. Fix get_user_edited_boards_with_details()
-- =============================================================================
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
    AND archived = false  -- Only include active (non-archived) boards
  ORDER BY last_edited_at DESC;
$$;

-- Fix poster board RPC functions to filter by archived = false
-- This ensures only active campaign data is returned, excluding archived data from previous campaigns (e.g., sangin-2025)

-- 1. Update get_poster_board_stats to filter by archived = false
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
    AND archived = false
  GROUP BY prefecture, status
  ORDER BY prefecture, status;
$$;

-- 2. Update get_poster_board_stats_optimized to filter by archived = false
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
      AND archived = false
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

-- 3. Update get_user_edited_boards_by_prefecture to filter by archived = false
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
    AND archived = false
  ORDER BY last_edited_at DESC;
$$;

-- 4. Update get_user_edited_boards_with_details to filter by archived = false
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
    AND archived = false
  ORDER BY last_edited_at DESC;
$$;

-- Add comment explaining the change
COMMENT ON FUNCTION get_poster_board_stats() IS 'Returns poster board statistics grouped by prefecture and status. Only includes non-archived (active campaign) data.';
COMMENT ON FUNCTION get_poster_board_stats_optimized(poster_prefecture_enum) IS 'Returns optimized poster board statistics for a specific prefecture. Only includes non-archived (active campaign) data.';
COMMENT ON FUNCTION get_user_edited_boards_by_prefecture(poster_prefecture_enum, uuid) IS 'Returns board IDs edited by a user in a prefecture. Only includes non-archived (active campaign) data.';
COMMENT ON FUNCTION get_user_edited_boards_with_details(poster_prefecture_enum, uuid) IS 'Returns detailed board info edited by a user in a prefecture. Only includes non-archived (active campaign) data.';

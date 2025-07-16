
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
  GROUP BY prefecture, status
  ORDER BY prefecture, status;
$$;

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
  )
  SELECT 
    total,
    jsonb_build_object(
      'not_yet', not_yet_count,
      'reserved', reserved_count,
      'done', done_count,
      'error_wrong_place', error_wrong_place_count,
      'error_damaged', error_damaged_count,
      'error_wrong_poster', error_wrong_poster_count,
      'other', other_count
    )
  FROM status_summary;
$$;

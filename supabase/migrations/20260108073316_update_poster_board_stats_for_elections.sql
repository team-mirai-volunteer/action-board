-- Update get_poster_board_stats to support election filtering
-- This function filters poster boards based on election_id in poster_board_status_history
CREATE OR REPLACE FUNCTION get_poster_board_stats(
  election_id_param uuid DEFAULT NULL
)
RETURNS TABLE (
  prefecture text,
  status poster_board_status,
  count bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    pb.prefecture::text,
    pb.status,
    COUNT(*)::bigint as count
  FROM poster_boards pb
  WHERE pb.prefecture IS NOT NULL
    AND pb.lat IS NOT NULL 
    AND pb.long IS NOT NULL
    AND (
      election_id_param IS NULL 
      OR pb.id IN (
        SELECT DISTINCT board_id 
        FROM poster_board_status_history 
        WHERE election_id = election_id_param
      )
    )
  GROUP BY pb.prefecture, pb.status
  ORDER BY pb.prefecture, pb.status;
$$;

-- Update get_poster_board_stats_optimized to support election filtering
CREATE OR REPLACE FUNCTION get_poster_board_stats_optimized(
  target_prefecture poster_prefecture_enum,
  election_id_param uuid DEFAULT NULL
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
    FROM poster_boards pb
    WHERE pb.prefecture = target_prefecture
      AND pb.lat IS NOT NULL 
      AND pb.long IS NOT NULL
      AND (
        election_id_param IS NULL 
        OR pb.id IN (
          SELECT DISTINCT board_id 
          FROM poster_board_status_history 
          WHERE election_id = election_id_param
        )
      )
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

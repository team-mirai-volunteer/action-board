-- Create a function to get poster board statistics
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
  GROUP BY prefecture, status
  ORDER BY prefecture, status;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_poster_board_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_poster_board_stats() TO anon;
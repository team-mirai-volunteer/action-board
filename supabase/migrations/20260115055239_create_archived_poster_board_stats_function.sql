-- Create a function to get archived poster board statistics by election term
CREATE OR REPLACE FUNCTION get_archived_poster_board_stats(p_election_term text)
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
    AND archived = true
    AND election_term = p_election_term
  GROUP BY prefecture, status
  ORDER BY prefecture, status;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_archived_poster_board_stats(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_archived_poster_board_stats(text) TO anon;

-- Add composite index for archived poster boards queries
-- This index improves performance for the above RPC function
-- which filters by archived = true AND election_term = X
CREATE INDEX idx_poster_boards_archived_election_term ON poster_boards(archived, election_term)
WHERE archived = true;

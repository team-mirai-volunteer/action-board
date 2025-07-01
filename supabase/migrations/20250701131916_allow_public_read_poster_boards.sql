-- Allow anonymous users to read poster boards
DROP POLICY IF EXISTS "poster_boards_authenticated_select" ON public.poster_boards;
CREATE POLICY "poster_boards_public_select" ON public.poster_boards
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Keep poster board status history private (authenticated users only)
-- Note: We are not modifying the existing RLS policy for poster_board_status_history
-- to protect user privacy. Only authenticated users can view the history.

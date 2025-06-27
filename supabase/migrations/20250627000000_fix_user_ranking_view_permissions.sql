-- Grant SELECT permission on user_ranking_view to anon and authenticated roles
GRANT SELECT ON user_ranking_view TO anon;
GRANT SELECT ON user_ranking_view TO authenticated;

-- Also add a policy to allow anonymous users to view user_levels for ranking purposes
CREATE POLICY "Anyone can view user levels for ranking"
    ON user_levels FOR SELECT
    TO anon
    USING (true);
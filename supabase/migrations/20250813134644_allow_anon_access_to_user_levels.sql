-- Allow anonymous users to read user_levels table
-- This is needed for public pages like user profiles and rankings

-- Add policy for anonymous users to view all user levels
CREATE POLICY "Anonymous users can view all user levels"
    ON user_levels FOR SELECT
    TO anon
    USING (true);
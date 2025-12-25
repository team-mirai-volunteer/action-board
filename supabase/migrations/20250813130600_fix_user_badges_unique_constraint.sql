-- Fix user_badges unique constraint to include season_id
-- This allows users to have the same badge type in different seasons

-- Drop the existing constraint
ALTER TABLE user_badges DROP CONSTRAINT IF EXISTS unique_user_badge_type;

-- Add new constraint that includes season_id
ALTER TABLE user_badges 
ADD CONSTRAINT unique_user_badge_type_season 
UNIQUE (user_id, badge_type, sub_type, season_id);
-- Add season system

-- 1. Create seasons table
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Add season_id to existing tables
ALTER TABLE xp_transactions ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES seasons(id);
ALTER TABLE user_levels ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES seasons(id);
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES seasons(id);
ALTER TABLE user_badges ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES seasons(id);

-- 3. Add indexes
CREATE INDEX IF NOT EXISTS idx_xp_transactions_season ON xp_transactions(user_id, season_id);
CREATE INDEX IF NOT EXISTS idx_user_levels_season ON user_levels(user_id, season_id);
CREATE INDEX IF NOT EXISTS idx_achievements_season ON achievements(user_id, season_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_season ON user_badges(user_id, season_id);

-- 4. Add composite unique constraint for user_levels
ALTER TABLE user_levels DROP CONSTRAINT IF EXISTS user_levels_user_id_key;
ALTER TABLE user_levels ADD CONSTRAINT user_levels_user_season_unique UNIQUE (user_id, season_id);

-- 5. Create season1 for existing data
INSERT INTO seasons (slug, name, start_date, end_date, is_active)
VALUES ('season1', '~2025参院選', '2025-06-01 00:00:00+09', '2025-07-19 23:59:59+09', true)
ON CONFLICT (slug) DO NOTHING;

-- 6. Associate existing data with season1
DO $$
DECLARE
  season1_id UUID;
BEGIN
  SELECT id INTO season1_id FROM seasons WHERE slug = 'season1';
  
  -- Update xp_transactions
  UPDATE xp_transactions 
  SET season_id = season1_id 
  WHERE season_id IS NULL;
  
  -- Update user_levels
  UPDATE user_levels 
  SET season_id = season1_id 
  WHERE season_id IS NULL;
  
  -- Update achievements
  UPDATE achievements 
  SET season_id = season1_id 
  WHERE season_id IS NULL;
  
  -- Update user_badges
  UPDATE user_badges 
  SET season_id = season1_id 
  WHERE season_id IS NULL;
END $$;

-- 7. Add RLS policies
-- Enable RLS for seasons table
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view seasons" ON seasons
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert seasons" ON seasons
  FOR INSERT WITH CHECK (false);

CREATE POLICY "Only admins can update seasons" ON seasons
  FOR UPDATE USING (false);

CREATE POLICY "Only admins can delete seasons" ON seasons
  FOR DELETE USING (false);
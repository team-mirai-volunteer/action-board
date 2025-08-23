-- Fix user_levels table to use composite primary key (user_id, season_id)

-- 1. First, drop the existing primary key constraint
ALTER TABLE user_levels DROP CONSTRAINT IF EXISTS user_levels_pkey;

-- 2. Drop the unique constraint we added before
ALTER TABLE user_levels DROP CONSTRAINT IF EXISTS user_levels_user_season_unique;

-- 3. Drop the single column unique constraint if it exists
ALTER TABLE user_levels DROP CONSTRAINT IF EXISTS user_levels_user_id_key;

-- 4. Add the new composite primary key
ALTER TABLE user_levels ADD CONSTRAINT user_levels_pkey PRIMARY KEY (user_id, season_id);

-- 5. Create an index on user_id for performance
CREATE INDEX IF NOT EXISTS idx_user_levels_user_id ON user_levels(user_id);

-- 6. Create an index on season_id for performance
CREATE INDEX IF NOT EXISTS idx_user_levels_season_id ON user_levels(season_id);
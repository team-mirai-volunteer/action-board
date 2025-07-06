-- Create user_badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('DAILY', 'ALL', 'PREFECTURE', 'MISSION')),
  sub_type TEXT, -- Prefecture name for PREFECTURE type, mission slug for MISSION type
  rank INTEGER NOT NULL CHECK (rank > 0),
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  is_notified BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Unique constraint to ensure only one badge per type/sub_type combination per user
  CONSTRAINT unique_user_badge_type UNIQUE (user_id, badge_type, sub_type)
);

-- Create indexes for performance
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_user_badges_badge_type ON public.user_badges(badge_type);
CREATE INDEX idx_user_badges_achieved_at ON public.user_badges(achieved_at);
CREATE INDEX idx_user_badges_is_notified ON public.user_badges(is_notified);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow anyone to view badges
CREATE POLICY "Anyone can view badges" ON public.user_badges
  FOR SELECT USING (true);

-- Only service role can insert/update/delete badges
CREATE POLICY "Service role can manage badges" ON public.user_badges
  FOR ALL USING (auth.role() = 'service_role');

-- Create updated_at trigger
CREATE TRIGGER update_user_badges_updated_at
  BEFORE UPDATE ON public.user_badges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE public.user_badges IS 'Stores user achievement badges based on rankings';
COMMENT ON COLUMN public.user_badges.badge_type IS 'Type of badge: DAILY, ALL, PREFECTURE, or MISSION';
COMMENT ON COLUMN public.user_badges.sub_type IS 'Sub-type for PREFECTURE (prefecture name) or MISSION (mission slug)';
COMMENT ON COLUMN public.user_badges.rank IS 'The rank achieved when the badge was earned';
COMMENT ON COLUMN public.user_badges.is_notified IS 'Whether the user has been notified about this badge';

-- Drop existing get_period_ranking functions (all versions)
DROP FUNCTION IF EXISTS get_period_ranking(integer);
DROP FUNCTION IF EXISTS get_period_ranking(integer, timestamp with time zone);
DROP FUNCTION IF EXISTS get_period_ranking(integer, timestamp with time zone, timestamp with time zone);

-- Create get_period_ranking function with proper type casting
CREATE OR REPLACE FUNCTION get_period_ranking(
    p_limit integer DEFAULT 100,
    p_start_date timestamp with time zone DEFAULT NULL,
    p_end_date timestamp with time zone DEFAULT NULL
)
RETURNS TABLE (
    user_id uuid,
    address_prefecture text,
    level integer,
    name text,
    rank bigint,
    updated_at timestamptz,
    xp bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH period_xp AS (
        SELECT 
            xt.user_id,
            SUM(xt.xp_amount) as total_xp
        FROM xp_transactions xt
        WHERE 
            (p_start_date IS NULL OR xt.created_at >= p_start_date)
            AND (p_end_date IS NULL OR xt.created_at < p_end_date)
        GROUP BY xt.user_id
    ),
    ranked_users AS (
        SELECT 
            px.user_id,
            pup.address_prefecture::text,
            COALESCE(ul.level, 1)::integer as level,
            pup.name::text,
            RANK() OVER (ORDER BY px.total_xp DESC)::bigint as rank,
            COALESCE(ul.updated_at, now())::timestamptz as updated_at,
            px.total_xp::bigint as xp
        FROM period_xp px
        JOIN public_user_profiles pup ON pup.id = px.user_id
        LEFT JOIN user_levels ul ON ul.user_id = px.user_id
    )
    SELECT 
        ru.user_id,
        ru.address_prefecture,
        ru.level,
        ru.name,
        ru.rank,
        ru.updated_at,
        ru.xp
    FROM ranked_users ru
    WHERE ru.rank <= p_limit
    ORDER BY ru.rank;
END;
$$;
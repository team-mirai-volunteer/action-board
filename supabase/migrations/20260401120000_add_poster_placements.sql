-- Create poster_placements table for free-hand poster tracking
-- Users pin locations on a map to record where they placed posters
CREATE TABLE IF NOT EXISTS public.poster_placements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  prefecture TEXT,
  city TEXT,
  address TEXT,
  postcode TEXT,
  poster_count INTEGER NOT NULL DEFAULT 1,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_poster_placements_user_id ON public.poster_placements(user_id);
CREATE INDEX idx_poster_placements_prefecture_city ON public.poster_placements(prefecture, city);
CREATE INDEX idx_poster_placements_created_at ON public.poster_placements(created_at DESC);

-- Updated_at trigger (function already exists from posting_shapes migration)
CREATE TRIGGER update_poster_placements_updated_at
  BEFORE UPDATE ON public.poster_placements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS: private by default, users can only access own data
ALTER TABLE public.poster_placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own placements"
  ON public.poster_placements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own placements"
  ON public.poster_placements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own placements"
  ON public.poster_placements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own placements"
  ON public.poster_placements FOR DELETE
  USING (auth.uid() = user_id);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.poster_placements TO authenticated;

-- ============================================================
-- Aggregation functions (SECURITY DEFINER to bypass RLS)
-- These return only public-safe data (no user_id exposed)
-- ============================================================

-- City-level stats: total poster count and contributor count per municipality
CREATE OR REPLACE FUNCTION get_poster_placement_stats_by_city()
RETURNS TABLE(prefecture TEXT, city TEXT, total_count BIGINT, contributor_count BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    pp.prefecture,
    pp.city,
    SUM(pp.poster_count)::BIGINT AS total_count,
    COUNT(DISTINCT pp.user_id)::BIGINT AS contributor_count
  FROM public.poster_placements pp
  WHERE pp.prefecture IS NOT NULL AND pp.city IS NOT NULL
  GROUP BY pp.prefecture, pp.city
  ORDER BY total_count DESC;
$$;

-- City detail: per-contributor breakdown using display names only (no user_id)
CREATE OR REPLACE FUNCTION get_poster_placement_city_detail(p_prefecture TEXT, p_city TEXT)
RETURNS TABLE(display_name TEXT, total_count BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(pup.name, '匿名') AS display_name,
    SUM(pp.poster_count)::BIGINT AS total_count
  FROM public.poster_placements pp
  LEFT JOIN public.public_user_profiles pup ON pp.user_id = pup.id
  WHERE pp.prefecture = p_prefecture AND pp.city = p_city
  GROUP BY pup.name
  ORDER BY total_count DESC;
$$;

-- Grant execute to both anon and authenticated for public aggregation
GRANT EXECUTE ON FUNCTION get_poster_placement_stats_by_city() TO anon;
GRANT EXECUTE ON FUNCTION get_poster_placement_stats_by_city() TO authenticated;
GRANT EXECUTE ON FUNCTION get_poster_placement_city_detail(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_poster_placement_city_detail(TEXT, TEXT) TO authenticated;

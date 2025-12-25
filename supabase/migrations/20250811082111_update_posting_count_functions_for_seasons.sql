-- Update get_user_posting_count_by_mission to support seasons

-- Drop and recreate the function with season support
DROP FUNCTION IF EXISTS get_user_posting_count_by_mission(UUID, UUID);

CREATE OR REPLACE FUNCTION get_user_posting_count_by_mission(
  target_user_id UUID,
  target_mission_id UUID,
  p_season_id UUID DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  total_count INTEGER := 0;
BEGIN
  IF p_season_id IS NOT NULL THEN
    -- Season-based counting
    SELECT COALESCE(SUM(pa.posting_count), 0)
      INTO total_count
      FROM posting_activities pa
      JOIN mission_artifacts ma ON pa.mission_artifact_id = ma.id
      JOIN achievements a ON a.id = ma.achievement_id
      WHERE ma.user_id = target_user_id
      AND a.mission_id = target_mission_id
      AND a.season_id = p_season_id;
  ELSE
    -- Legacy counting (all seasons)
    SELECT COALESCE(SUM(pa.posting_count), 0)
      INTO total_count
      FROM posting_activities pa
      JOIN mission_artifacts ma ON pa.mission_artifact_id = ma.id
      JOIN achievements a ON a.id = ma.achievement_id
      WHERE ma.user_id = target_user_id
      AND a.mission_id = target_mission_id;
  END IF;
  
  RETURN total_count;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_posting_count_by_mission TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_posting_count_by_mission TO anon;

-- Update get_top_users_posting_count_by_mission to support seasons as well
DROP FUNCTION IF EXISTS get_top_users_posting_count_by_mission(UUID[], UUID);

CREATE OR REPLACE FUNCTION get_top_users_posting_count_by_mission(
  user_ids UUID[],
  target_mission_id UUID,
  p_season_id UUID DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  posting_count INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  IF p_season_id IS NOT NULL THEN
    -- Season-based counting
    RETURN QUERY
    SELECT 
      ma.user_id,
      COALESCE(SUM(pa.posting_count), 0)::INTEGER as posting_count
    FROM mission_artifacts ma
    JOIN achievements a ON a.id = ma.achievement_id
    LEFT JOIN posting_activities pa ON pa.mission_artifact_id = ma.id
    WHERE ma.user_id = ANY(user_ids)
    AND a.mission_id = target_mission_id
    AND a.season_id = p_season_id
    GROUP BY ma.user_id;
  ELSE
    -- Legacy counting (all seasons)
    RETURN QUERY
    SELECT 
      ma.user_id,
      COALESCE(SUM(pa.posting_count), 0)::INTEGER as posting_count
    FROM mission_artifacts ma
    JOIN achievements a ON a.id = ma.achievement_id
    LEFT JOIN posting_activities pa ON pa.mission_artifact_id = ma.id
    WHERE ma.user_id = ANY(user_ids)
    AND a.mission_id = target_mission_id
    GROUP BY ma.user_id;
  END IF;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_top_users_posting_count_by_mission TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_users_posting_count_by_mission TO anon;
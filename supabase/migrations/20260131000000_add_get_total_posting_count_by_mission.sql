-- Add function to get total posting count across all users for a specific mission
-- Used to display "みんなで{count}枚達成" on posting mission cards

CREATE OR REPLACE FUNCTION get_total_posting_count_by_mission(
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
      WHERE a.mission_id = target_mission_id
      AND a.season_id = p_season_id;
  ELSE
    -- Legacy counting (all seasons)
    SELECT COALESCE(SUM(pa.posting_count), 0)
      INTO total_count
      FROM posting_activities pa
      JOIN mission_artifacts ma ON pa.mission_artifact_id = ma.id
      JOIN achievements a ON a.id = ma.achievement_id
      WHERE a.mission_id = target_mission_id;
  END IF;

  RETURN total_count;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_total_posting_count_by_mission TO authenticated;
GRANT EXECUTE ON FUNCTION get_total_posting_count_by_mission TO anon;

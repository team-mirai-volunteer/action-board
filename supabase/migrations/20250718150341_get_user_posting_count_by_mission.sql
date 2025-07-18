CREATE OR REPLACE FUNCTION public.get_user_posting_count_by_mission(
    target_user_id UUID,
    target_mission_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_count INTEGER := 0;
BEGIN
  SELECT COALESCE(SUM(pa.posting_count), 0)
    INTO total_count
    FROM posting_activities pa
    JOIN mission_artifacts ma ON pa.mission_artifact_id = ma.id
    JOIN achievements a ON a.id = ma.achievement_id
    WHERE ma.user_id = target_user_id
    AND a.mission_id = target_mission_id;
  RETURN total_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_top_users_posting_count_by_mission(
    user_ids UUID[],
    target_mission_id UUID
)
RETURNS TABLE(user_id UUID, posting_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ma.user_id,
    COALESCE(SUM(pa.posting_count), 0) as posting_count
  FROM mission_artifacts ma
  LEFT JOIN posting_activities pa ON ma.id = pa.mission_artifact_id
  JOIN achievements a ON a.id = ma.achievement_id
  WHERE ma.user_id = ANY(user_ids)
  AND a.mission_id = target_mission_id
  GROUP BY ma.user_id
  HAVING COALESCE(SUM(pa.posting_count), 0) > 0
  ORDER BY posting_count DESC;
END;
$$;

-- 関数の権限設定
GRANT EXECUTE ON FUNCTION public.get_user_posting_count_by_mission TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_users_posting_count_by_mission TO authenticated;

COMMENT ON FUNCTION public.get_user_posting_count_by_mission IS 'ミッション別のユーザーポスティング枚数を取得する関数';
COMMENT ON FUNCTION public.get_top_users_posting_count_by_mission IS '複数ユーザーのミッション別ポスティング枚数を取得する関数';

-- ダウングレード用: 関数削除
-- DROP FUNCTION IF EXISTS public.get_user_posting_count_by_mission(UUID, UUID);
-- DROP FUNCTION IF EXISTS public.get_top_users_posting_count_by_mission(UUID[], UUID);

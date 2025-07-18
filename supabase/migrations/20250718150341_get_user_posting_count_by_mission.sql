CREATE OR REPLACE FUNCTION public.get_user_posting_count_by_mission(
    target_user_id UUID,
    target_mission_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
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

-- 関数の権限設定
GRANT EXECUTE ON FUNCTION public.get_user_posting_count_by_mission TO authenticated;

COMMENT ON FUNCTION public.get_user_posting_count_by_mission IS 'ミッション別のユーザーポスティング枚数を取得する関数';

-- ダウングレード用: 関数削除
-- DROP FUNCTION IF EXISTS public.get_user_posting_count_by_mission(UUID, UUID);

-- ポスティング枚数合計を取得するRPC関数
CREATE OR REPLACE FUNCTION public.get_user_posting_count(target_user_id UUID)
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
    WHERE ma.user_id = target_user_id;
  RETURN total_count;
END;
$$;

-- ダウングレード用: 関数削除
-- DROP FUNCTION IF EXISTS public.get_user_posting_count(UUID);

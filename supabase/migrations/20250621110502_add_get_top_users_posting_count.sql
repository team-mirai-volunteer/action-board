-- 全てのユーザーのポスティング枚数合計を取得するRPC関数
CREATE OR REPLACE FUNCTION public.get_top_users_posting_count(user_ids UUID[])
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
  WHERE ma.user_id = ANY(user_ids)
  GROUP BY ma.user_id
  HAVING COALESCE(SUM(pa.posting_count), 0) > 1
  ORDER BY posting_count DESC;
END;
$$;

-- ダウングレード用: 関数削除
-- DROP FUNCTION IF EXISTS public.get_all_users_posting_count();
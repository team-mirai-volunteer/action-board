CREATE OR REPLACE FUNCTION public.get_total_posting_count()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  total_count INTEGER := 0;
BEGIN
  SELECT COALESCE(SUM(pa.posting_count), 0)
    INTO total_count
    FROM posting_activities pa;
  RETURN total_count;
END;
$$;

-- ダウングレード用: 関数削除
-- DROP FUNCTION IF EXISTS public.get_total_posting_count();

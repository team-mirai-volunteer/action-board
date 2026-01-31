-- ミッション別アクションランキング関数にis_hiddenフラグを追加
-- 戻り値の型が変わるため、一度削除してから再作成
DROP FUNCTION IF EXISTS get_mission_action_ranking(TIMESTAMPTZ, TIMESTAMPTZ, INTEGER);

CREATE FUNCTION get_mission_action_ranking(
  start_date TIMESTAMPTZ DEFAULT NULL,
  end_date TIMESTAMPTZ DEFAULT NULL,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  mission_id UUID,
  mission_title TEXT,
  mission_slug TEXT,
  icon_url TEXT,
  action_count BIGINT,
  is_hidden BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id as mission_id,
    m.title::TEXT as mission_title,
    m.slug::TEXT as mission_slug,
    m.icon_url::TEXT,
    COUNT(a.id) as action_count,
    m.is_hidden
  FROM achievements a
  INNER JOIN missions m ON a.mission_id = m.id
  WHERE (start_date IS NULL OR a.created_at >= start_date)
    AND (end_date IS NULL OR a.created_at < end_date + INTERVAL '1 day')
  GROUP BY m.id, m.title, m.slug, m.icon_url, m.is_hidden
  ORDER BY action_count DESC
  LIMIT limit_count;
END;
$$;

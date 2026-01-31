-- 日別アクティブユーザー数推移を取得する関数
CREATE FUNCTION get_daily_active_users_history(
  start_date TIMESTAMPTZ DEFAULT NULL,
  end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  date TEXT,
  count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_char(a.created_at AT TIME ZONE 'Asia/Tokyo', 'YYYY-MM-DD') as date,
    COUNT(DISTINCT a.user_id) as count
  FROM achievements a
  WHERE (start_date IS NULL OR a.created_at >= start_date)
    AND (end_date IS NULL OR a.created_at < end_date + INTERVAL '1 day')
  GROUP BY to_char(a.created_at AT TIME ZONE 'Asia/Tokyo', 'YYYY-MM-DD')
  ORDER BY date ASC;
END;
$$;

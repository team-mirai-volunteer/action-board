-- アクション統計用のRPC関数を追加

-- サマリー取得関数
CREATE OR REPLACE FUNCTION get_action_stats_summary(
  start_date TIMESTAMPTZ DEFAULT NULL,
  end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  total_actions BIGINT,
  active_users BIGINT,
  daily_actions_increase BIGINT,
  daily_users_increase BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  yesterday TIMESTAMPTZ := NOW() - INTERVAL '24 hours';
BEGIN
  RETURN QUERY
  WITH filtered AS (
    SELECT user_id, created_at
    FROM achievements
    WHERE (start_date IS NULL OR created_at >= start_date)
      AND (end_date IS NULL OR created_at < end_date + INTERVAL '1 day')
  ),
  totals AS (
    SELECT
      COUNT(*) as total_actions,
      COUNT(DISTINCT user_id) as active_users
    FROM filtered
  ),
  daily AS (
    SELECT
      COUNT(*) as daily_actions,
      COUNT(DISTINCT user_id) as daily_users
    FROM filtered
    WHERE created_at >= yesterday
  )
  SELECT
    totals.total_actions,
    totals.active_users,
    daily.daily_actions,
    daily.daily_users
  FROM totals, daily;
END;
$$;

-- 日別アクション推移取得関数
CREATE OR REPLACE FUNCTION get_daily_action_history(
  start_date TIMESTAMPTZ DEFAULT NULL,
  end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  date DATE,
  count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(created_at AT TIME ZONE 'Asia/Tokyo') as date,
    COUNT(*) as count
  FROM achievements
  WHERE (start_date IS NULL OR created_at >= start_date)
    AND (end_date IS NULL OR created_at < end_date + INTERVAL '1 day')
  GROUP BY DATE(created_at AT TIME ZONE 'Asia/Tokyo')
  ORDER BY date ASC;
END;
$$;

-- ミッション別アクションランキング取得関数
CREATE OR REPLACE FUNCTION get_mission_action_ranking(
  start_date TIMESTAMPTZ DEFAULT NULL,
  end_date TIMESTAMPTZ DEFAULT NULL,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  mission_id UUID,
  mission_title TEXT,
  mission_slug TEXT,
  icon_url TEXT,
  action_count BIGINT
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
    COUNT(a.id) as action_count
  FROM achievements a
  INNER JOIN missions m ON a.mission_id = m.id
  WHERE m.is_hidden = false
    AND (start_date IS NULL OR a.created_at >= start_date)
    AND (end_date IS NULL OR a.created_at < end_date + INTERVAL '1 day')
  GROUP BY m.id, m.title, m.slug, m.icon_url
  ORDER BY action_count DESC
  LIMIT limit_count;
END;
$$;

-- daily_action_summaryテーブルを削除
DROP POLICY IF EXISTS select_all_daily_action_summary ON daily_action_summary;
DROP TABLE IF EXISTS daily_action_summary;

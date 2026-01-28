-- ポスティングミッションを1枚1アクションとしてカウントするように更新

-- サマリー取得関数を更新
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
  WITH action_counts AS (
    -- 通常のアクション: 1アクション
    -- ポスティング: posting_count枚 = posting_countアクション
    SELECT
      a.user_id,
      a.created_at,
      COALESCE(pa.posting_count, 1)::BIGINT as action_count
    FROM achievements a
    LEFT JOIN mission_artifacts ma ON ma.achievement_id = a.id
    LEFT JOIN posting_activities pa ON pa.mission_artifact_id = ma.id
    WHERE (start_date IS NULL OR a.created_at >= start_date)
      AND (end_date IS NULL OR a.created_at < end_date + INTERVAL '1 day')
  ),
  totals AS (
    SELECT
      SUM(action_count) as total_actions,
      COUNT(DISTINCT user_id) as active_users
    FROM action_counts
  ),
  daily AS (
    SELECT
      SUM(action_count) as daily_actions,
      COUNT(DISTINCT user_id) as daily_users
    FROM action_counts
    WHERE created_at >= yesterday
  )
  SELECT
    COALESCE(totals.total_actions, 0)::BIGINT,
    COALESCE(totals.active_users, 0)::BIGINT,
    COALESCE(daily.daily_actions, 0)::BIGINT,
    COALESCE(daily.daily_users, 0)::BIGINT
  FROM totals, daily;
END;
$$;

-- 日別アクション推移取得関数を更新（戻り値の型が変わるため再作成）
DROP FUNCTION IF EXISTS get_daily_action_history(TIMESTAMPTZ, TIMESTAMPTZ);

CREATE FUNCTION get_daily_action_history(
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
    SUM(COALESCE(pa.posting_count, 1))::BIGINT as count
  FROM achievements a
  LEFT JOIN mission_artifacts ma ON ma.achievement_id = a.id
  LEFT JOIN posting_activities pa ON pa.mission_artifact_id = ma.id
  WHERE (start_date IS NULL OR a.created_at >= start_date)
    AND (end_date IS NULL OR a.created_at < end_date + INTERVAL '1 day')
  GROUP BY to_char(a.created_at AT TIME ZONE 'Asia/Tokyo', 'YYYY-MM-DD')
  ORDER BY date ASC;
END;
$$;

-- 日別アクティブユーザー数推移取得関数を更新（これはユーザー数なので変更不要だが、一貫性のためにコメント追加）
-- get_daily_active_users_history は DISTINCT user_id のカウントなので変更不要

-- ミッション別アクションランキング取得関数を更新
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
    SUM(COALESCE(pa.posting_count, 1))::BIGINT as action_count,
    m.is_hidden
  FROM achievements a
  INNER JOIN missions m ON a.mission_id = m.id
  LEFT JOIN mission_artifacts ma ON ma.achievement_id = a.id
  LEFT JOIN posting_activities pa ON pa.mission_artifact_id = ma.id
  WHERE (start_date IS NULL OR a.created_at >= start_date)
    AND (end_date IS NULL OR a.created_at < end_date + INTERVAL '1 day')
  GROUP BY m.id, m.title, m.slug, m.icon_url, m.is_hidden
  ORDER BY action_count DESC
  LIMIT limit_count;
END;
$$;

-- activity_timeline_view に mission_slug を追加
DROP VIEW IF EXISTS activity_timeline_view;

CREATE VIEW activity_timeline_view AS
-- 各テーブルから最新の50件ずつ取得してからUNION ALLを実行。大量のachievementsデータに対するパフォーマンスを改善
(
  -- ミッション達成のアクティビティ
  SELECT
    ('achievement_' || a.id::text) as id,
    p.id as user_id,
    p.name,
    p.address_prefecture,
    p.avatar_url,
    m.title,
    a.mission_id,
    m.slug as mission_slug,
    a.created_at,
    'mission_achievement' as activity_type
  FROM achievements a
  JOIN public_user_profiles p ON a.user_id = p.id
  JOIN missions m ON a.mission_id = m.id
  ORDER BY a.created_at DESC
  LIMIT 50
)

UNION ALL

(
  -- ユーザーアクティビティ（サインアップなど）
  SELECT
    ('activity_' || ua.id::text) as id,
    p.id as user_id,
    p.name,
    p.address_prefecture,
    p.avatar_url,
    ua.activity_title as title,
    NULL as mission_id,
    NULL as mission_slug,
    ua.created_at,
    ua.activity_type
  FROM user_activities ua
  JOIN public_user_profiles p ON ua.user_id = p.id
  ORDER BY ua.created_at DESC
  LIMIT 50
)

ORDER BY created_at DESC;

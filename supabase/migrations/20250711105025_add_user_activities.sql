-- サインアップなどのユーザーアクティビティを記録するテーブル
CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public_user_profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    activity_title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE user_activities IS 'ユーザーの活動記録（サインアップ、レベルアップなど）';
COMMENT ON COLUMN user_activities.user_id IS 'アクティビティを行ったユーザーのID';
COMMENT ON COLUMN user_activities.activity_type IS 'アクティビティの種類（signup, level_up など）';
COMMENT ON COLUMN user_activities.activity_title IS 'アクティビティの表示タイトル';
COMMENT ON COLUMN user_activities.created_at IS '記録日時(UTC)';

-- RLS設定
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが全ての活動を読み取れる
CREATE POLICY select_all_user_activities
  ON user_activities
  FOR SELECT
  TO authenticated
  USING (true);

-- ユーザーは自分のアクティビティのみ挿入可能
CREATE POLICY insert_own_user_activity
  ON user_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- インデックスの追加
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at DESC);
CREATE INDEX idx_user_activities_activity_type ON user_activities(activity_type);

-- 活動タイムラインビューを更新して、ミッション達成とユーザーアクティビティを統合
DROP VIEW IF EXISTS activity_timeline_view;

CREATE VIEW activity_timeline_view AS
-- ミッション達成のアクティビティ
SELECT
  ('achievement_' || a.id::text) as id,
  p.id as user_id,
  p.name,
  p.address_prefecture,
  p.avatar_url,
  m.title,
  a.created_at,
  'mission_achievement' as activity_type
FROM achievements a
JOIN public_user_profiles p ON a.user_id = p.id
JOIN missions m ON a.mission_id = m.id

UNION ALL

-- ユーザーアクティビティ（サインアップなど）
SELECT
  ('activity_' || ua.id::text) as id,
  p.id as user_id,
  p.name,
  p.address_prefecture,
  p.avatar_url,
  ua.activity_title as title,
  ua.created_at,
  ua.activity_type
FROM user_activities ua
JOIN public_user_profiles p ON ua.user_id = p.id

ORDER BY created_at DESC;
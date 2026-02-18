-- ミッション詳細ページのパフォーマンス改善用インデックス
-- achievements テーブルへの (user_id, mission_id, created_at DESC) 複合インデックス
-- ページ読み込み・記録の両方で使われる最頻クエリパターンに対応
CREATE INDEX IF NOT EXISTS idx_achievements_user_mission_created
  ON achievements(user_id, mission_id, created_at DESC);

-- mission_artifactsテーブルのachievement_idにユニーク制約を追加
-- 1つのachievementに対して1つのartifactのみ許可する

-- 既存のインデックスを削除（ユニーク制約で新しいインデックスが作成されるため）
DROP INDEX IF EXISTS idx_mission_artifacts_achievement_id;

-- ユニーク制約を追加
ALTER TABLE mission_artifacts
  ADD CONSTRAINT mission_artifacts_achievement_id_unique UNIQUE (achievement_id);

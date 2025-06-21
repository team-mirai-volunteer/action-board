ALTER TABLE missions ADD COLUMN daily_attempt_limit INTEGER;

COMMENT ON COLUMN missions.daily_attempt_limit IS 'ミッションの1日あたりの最大挑戦回数。NULLの場合は無制限。';

CREATE TABLE daily_mission_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    attempt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    attempt_count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, mission_id, attempt_date)
);

COMMENT ON TABLE daily_mission_attempts IS 'ユーザーの日次ミッション挑戦回数を記録するテーブル';
COMMENT ON COLUMN daily_mission_attempts.id IS '記録ID';
COMMENT ON COLUMN daily_mission_attempts.user_id IS 'ユーザーID';
COMMENT ON COLUMN daily_mission_attempts.mission_id IS 'ミッションID';
COMMENT ON COLUMN daily_mission_attempts.attempt_date IS '挑戦日（UTC）';
COMMENT ON COLUMN daily_mission_attempts.attempt_count IS 'その日の挑戦回数';
COMMENT ON COLUMN daily_mission_attempts.created_at IS '作成日時(UTC)';
COMMENT ON COLUMN daily_mission_attempts.updated_at IS '更新日時(UTC)';

ALTER TABLE daily_mission_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY insert_own_daily_attempts
  ON daily_mission_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_own_daily_attempts
  ON daily_mission_attempts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY select_own_daily_attempts
  ON daily_mission_attempts FOR SELECT
  USING (auth.uid() = user_id);


CREATE OR REPLACE FUNCTION update_daily_mission_attempts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_daily_mission_attempts_updated_at
    BEFORE UPDATE ON daily_mission_attempts
    FOR EACH ROW
    EXECUTE PROCEDURE update_daily_mission_attempts_updated_at();

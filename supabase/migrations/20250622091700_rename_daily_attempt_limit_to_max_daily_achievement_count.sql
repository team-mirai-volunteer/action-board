ALTER TABLE missions RENAME COLUMN daily_attempt_limit TO max_daily_achievement_count;

COMMENT ON COLUMN missions.max_daily_achievement_count IS 'ミッションの1日あたりの最大達成回数。NULLの場合は無制限。';

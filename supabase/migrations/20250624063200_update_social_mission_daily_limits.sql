
ALTER TABLE missions 
ADD COLUMN max_daily_achievement_count INTEGER;

COMMENT ON COLUMN missions.max_daily_achievement_count IS 'ミッションの1日あたりの最大達成可能回数。NULLの場合は無制限。';

UPDATE missions 
SET max_daily_achievement_count = 1 
WHERE title = 'Instagram でチームみらい投稿に♡をつけよう';

UPDATE missions 
SET max_daily_achievement_count = 1 
WHERE title = 'X でチームみらい投稿に♡をつけよう';

UPDATE missions 
SET max_daily_achievement_count = 3 
WHERE title = 'note でチームみらい記事にスキ♡をつけよう';

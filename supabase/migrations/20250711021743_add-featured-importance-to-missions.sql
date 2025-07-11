ALTER TABLE missions ADD COLUMN featured_importance INTEGER;
COMMENT ON COLUMN missions.featured_importance IS '重要ミッション用の重要度（表示順に用いる）';

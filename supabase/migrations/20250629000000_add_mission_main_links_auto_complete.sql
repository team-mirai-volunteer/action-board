ALTER TABLE mission_main_links
ADD COLUMN auto_complete BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN mission_main_links.auto_complete IS 'リンククリック時に自動的にミッションを達成するかどうかのフラグ。trueの場合、リンククリックで自動達成される';

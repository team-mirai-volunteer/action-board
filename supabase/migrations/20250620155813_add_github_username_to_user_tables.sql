ALTER TABLE public_user_profiles ADD COLUMN github_username VARCHAR(45);
COMMENT ON COLUMN public_user_profiles.github_username IS 'GitHubのユーザー名。NULL可能';

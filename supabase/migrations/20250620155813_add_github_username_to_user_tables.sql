-- github_usernameカラムをprivate_usersとpublic_user_profilesに追加
ALTER TABLE private_users ADD COLUMN github_username VARCHAR(45);
COMMENT ON COLUMN private_users.github_username IS 'GitHubのユーザー名。NULL可能';

ALTER TABLE public_user_profiles ADD COLUMN github_username VARCHAR(45);
COMMENT ON COLUMN public_user_profiles.github_username IS 'GitHubのユーザー名。NULL可能';

-- トリガー関数をgithub_username対応で再作成
DROP TRIGGER IF EXISTS trg_sync_public_user_profile ON private_users;
DROP FUNCTION IF EXISTS sync_public_user_profile();

CREATE OR REPLACE FUNCTION sync_public_user_profile()
RETURNS trigger AS $$
BEGIN
  -- トリガーからの実行であることを示すカスタム設定を追加
  PERFORM set_config('my.is_trigger', 'true', true);

  -- INSERT or UPDATE の場合は upsert
  INSERT INTO public_user_profiles (
    id, name, address_prefecture, x_username, github_username, avatar_url, created_at
  )
  VALUES (
    NEW.id, NEW.name, NEW.address_prefecture, NEW.x_username, NEW.github_username, NEW.avatar_url, NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      address_prefecture = EXCLUDED.address_prefecture,
      x_username = EXCLUDED.x_username,
      github_username = EXCLUDED.github_username,
      avatar_url = EXCLUDED.avatar_url,
      created_at = EXCLUDED.created_at;

  -- カスタム設定をリセット
  PERFORM set_config('my.is_trigger', 'false', true);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;  -- SECURITY DEFINERに変更

CREATE TRIGGER trg_sync_public_user_profile
AFTER INSERT OR UPDATE ON private_users
FOR EACH ROW
EXECUTE FUNCTION sync_public_user_profile();

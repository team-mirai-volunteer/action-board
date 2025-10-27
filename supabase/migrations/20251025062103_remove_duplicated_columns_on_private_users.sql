-- private_usersテーブル
-- private_usersテーブルから不要なカラムを削除する。public_user_profilesテーブルに存在するため
ALTER TABLE private_users
  DROP COLUMN IF EXISTS address_prefecture,
  DROP COLUMN IF EXISTS avatar_url,
  DROP COLUMN IF EXISTS name,
  DROP COLUMN IF EXISTS x_username;

-- private_users -> public_user_profiles にデータを同期するsync_public_user_profileトリガーを削除
DROP TRIGGER IF EXISTS trg_sync_public_user_profile ON private_users;
DROP FUNCTION IF EXISTS sync_public_user_profile();


-- public_user_profiles を直接更新できるようにする
-- created_atカラムにデフォルト値を設定
ALTER TABLE public_user_profiles
  ALTER COLUMN created_at SET DEFAULT now();
-- updated_atカラムを追加
ALTER TABLE public_user_profiles
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();

-- public_user_profilesテーブルに対するtrigger-onlyのポリシーを削除
DROP POLICY IF EXISTS insert_trigger_only_public_user_profiles ON public_user_profiles;
DROP POLICY IF EXISTS update_trigger_only_public_user_profiles ON public_user_profiles;

-- ユーザーは自分のプロフィールのみ挿入可能
CREATE POLICY insert_own_profile
  ON public_user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
-- ユーザーは自分のプロフィールのみ更新可能
CREATE POLICY update_own_profile
  ON public_user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

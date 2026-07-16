-- データ分析基盤(BigQuery)へメールアドレスを連携するためのミラーテーブル
--
-- 背景:
--   20260716000000 で auth.users を直接レプリケーション対象にしようとしたが、
--   ホスト版 Supabase では auth スキーマの所有者が supabase_admin であり、
--   マイグレーション実行ロール(postgres)には GRANT OPTION が無いため、
--   bq_user への GRANT が「WARNING (01007): no privileges were granted」の
--   no-op になる（デプロイログで確認済み）。手動実行(SQL Editor)でも同じ。
--   その結果、Datastream の auth スキーマ読み取りは権限検証
--   (POSTGRES_SCHEMAS_MISSING_PERMISSIONS) で失敗する。
--
-- 方針:
--   public スキーマに auth.users.email のミラーテーブル public.user_emails を作成し、
--   トリガーで同期する（auth.users へのトリガー作成は Supabase 公式ドキュメントにもある
--   標準パターン）。これにより:
--   - publication bq_pub は FOR ALL TABLES のため本テーブルは自動的に配信対象になる
--   - bq_user には public スキーマのデフォルト権限で SELECT が付与される
--   - RLS を有効化しポリシーを作らないため、アプリ(anon/authenticated)からは参照不可
--   - Datastream は public スキーマのみで完結し、auth スキーマの追加は不要
--   - email 以外の auth.users のカラム（パスワードハッシュ・トークン等）を分析基盤に流さない

-- 1. ミラーテーブル
CREATE TABLE IF NOT EXISTS public.user_emails (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.user_emails IS 'auth.users.email のミラー。データ分析基盤(BigQuery)連携専用。アプリからは参照しない';
COMMENT ON COLUMN public.user_emails.id IS 'ユーザーのUUID。auth.users.id を参照';
COMMENT ON COLUMN public.user_emails.email IS 'メールアドレス。トリガーで auth.users.email と同期される';
COMMENT ON COLUMN public.user_emails.created_at IS 'auth.users.created_at のミラー（ユーザー登録日時）';
COMMENT ON COLUMN public.user_emails.updated_at IS 'このミラー行が最後に同期された日時';

-- 2. アプリからのアクセスを遮断（RLS有効・ポリシーなし + 明示的REVOKE）
ALTER TABLE public.user_emails ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.user_emails FROM anon, authenticated;

-- 3. 同期トリガー
--    auth.users への書き込みは supabase_auth_admin が行うため、
--    public テーブルへ書き込めるよう SECURITY DEFINER にする（所有者は postgres）
CREATE OR REPLACE FUNCTION public.sync_user_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_emails (id, email, created_at)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.created_at, now()))
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = now();
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- ミラー更新の失敗でサインアップ等の認証処理を止めない
    RAISE WARNING 'sync_user_email failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.sync_user_email() IS 'auth.users の INSERT / email UPDATE を public.user_emails に同期する（BigQuery連携用）';

DROP TRIGGER IF EXISTS trg_sync_user_email ON auth.users;
CREATE TRIGGER trg_sync_user_email
  AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_email();

-- 4. 既存ユーザーのバックフィル
--    created_at は auth.users.created_at（登録日時）を引き継ぐ（分析での登録日時の正確性のため）
INSERT INTO public.user_emails (id, email, created_at)
SELECT id, email, COALESCE(created_at, now()) FROM auth.users
ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      updated_at = now();

-- 5. bq_user への SELECT（public のデフォルト権限で付与されるはずだが冪等に明示）
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'bq_user') THEN
    GRANT SELECT ON public.user_emails TO bq_user;
  END IF;
END $$;

-- 検証クエリ（手動実行用・コメントアウト）:
/*
-- ミラーが埋まっているか（auth.users と件数が一致するはず）
SELECT
  (SELECT COUNT(*) FROM auth.users)        AS auth_users,
  (SELECT COUNT(*) FROM public.user_emails) AS user_emails;

-- bq_user が読めるか
SELECT has_table_privilege('bq_user', 'public.user_emails', 'SELECT');

-- publication に含まれているか（FOR ALL TABLES なら自動で列挙される）
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'bq_pub' AND tablename = 'user_emails';
*/

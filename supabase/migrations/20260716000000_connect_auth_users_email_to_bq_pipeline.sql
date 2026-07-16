-- データ分析基盤（BigQuery）へ auth.users（Eメール）を連携する
--
-- 背景:
--   BigQuery へのデータ連携は論理レプリケーションで行われている。
--   publication `bq_pub` + レプリケーションスロット `bq_slot` を `bq_user` が読み取る構成
--   （20250620122832_bigquery_replication_setup.sql を参照）。
--
--   ユーザーID・都道府県は public スキーマの `public.public_user_profiles`
--   （id, address_prefecture）として既に連携されている。一方、Eメールは
--   `auth.users.email`（auth スキーマ）にあり、連携対象に入っていなかったため
--   分析基盤に届いていなかった。
--
--   #2192（20260402000000_grant_bq_user_auth_users.sql）で bq_user に auth.users の
--   SELECT 権限を付与済み。本マイグレーションは DB 側の連携設定を冪等かつ明示的にし、
--   auth.users が確実に publication に含まれるようにする:
--     1. bq_user の auth.users 読み取り権限を（冪等に）再付与する
--     2. auth.users が publication `bq_pub` のメンバーであることを保証する
--
--   注意: 実際に BigQuery へ取り込む外部の取り込み側（Datastream 等）でも、対象に
--   `auth` スキーマ / `auth.users` を追加する必要がある。これは本リポジトリの外で設定する。
--   詳細・手順は docs/20260716_1200_データ分析基盤へのEメール連携.md を参照。

-- 1. bq_user が auth.users を読み取れるようにする（#2192 と同内容。冪等・環境安全）
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'bq_user') THEN
    GRANT USAGE ON SCHEMA auth TO bq_user;
    GRANT SELECT ON auth.users TO bq_user;
  ELSE
    RAISE NOTICE 'Role bq_user does not exist; skipping grants (run 20250620122832 first).';
  END IF;
END $$;

-- 2. auth.users が publication `bq_pub` で配信されることを保証する。
--    `FOR ALL TABLES` の publication は auth.users を既に含んでおり、その場合
--    ALTER PUBLICATION ... ADD TABLE はエラーになるため、テーブル列挙型の publication で
--    かつ auth.users が未追加のときだけ追加する。
DO $$
DECLARE
  is_all_tables boolean;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'bq_pub') THEN
    RAISE NOTICE 'Publication bq_pub does not exist; skipping (run 20250620122832 first).';
    RETURN;
  END IF;

  SELECT puballtables INTO is_all_tables FROM pg_publication WHERE pubname = 'bq_pub';

  IF is_all_tables THEN
    -- FOR ALL TABLES は auth.users を既にカバーしているため何もしない
    RAISE NOTICE 'bq_pub is FOR ALL TABLES; auth.users is already published.';
  ELSIF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'bq_pub' AND schemaname = 'auth' AND tablename = 'users'
  ) THEN
    ALTER PUBLICATION bq_pub ADD TABLE auth.users;
  END IF;
END $$;

-- 検証クエリ（手動実行用・コメントアウト）:
/*
-- bq_user が auth.users を読めるか
SELECT has_table_privilege('bq_user', 'auth.users', 'SELECT');

-- auth.users が publication に含まれるか（FOR ALL TABLES の場合も列挙される）
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'bq_pub' AND schemaname = 'auth';

-- publication の種別確認
SELECT pubname, puballtables FROM pg_publication WHERE pubname = 'bq_pub';
*/

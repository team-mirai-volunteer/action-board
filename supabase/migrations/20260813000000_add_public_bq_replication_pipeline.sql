-- データ分析基盤（BigQuery）の「パブリック版」パイプライン用の
-- publication / レプリケーションスロットを追加する
--
-- 背景:
--   既存の連携は publication `bq_pub`（FOR ALL TABLES）+ スロット `bq_slot` の1系統のみ
--   （20250620122832_bigquery_replication_setup.sql）。FOR ALL TABLES のため auth スキーマ等
--   すべてのテーブルが配信対象になる。
--
--   データ基盤を「プライベート版（＝従来の全テーブル）」と「（社内）パブリック版」の
--   2系統に分けるため、public スキーマのテーブルのみを対象とする publication
--   `bq_pub_for_all` と、そのためのスロット `bq_slot_for_all` を新設する。
--   既存の `bq_pub` / `bq_slot` はプライベート版としてそのまま維持する。
--
-- 注意（重要）:
--   1. public スキーマには `public.user_emails`（auth.users.email のミラー。
--      20260716073000_add_user_emails_mirror_for_bq.sql）が存在するため、
--      `FOR TABLES IN SCHEMA public` はメールアドレスも配信対象に含む。
--      パブリック版にメールアドレスを含めたくない場合は、
--      publication をテーブル列挙型（FOR TABLE a, b, c ...）にするか、
--      user_emails を別スキーマ（例: private）へ移す必要がある。
--      PostgreSQL 15 では `FOR TABLES IN SCHEMA ... EXCEPT` は使えない。
--   2. スロットは作成した時点から WAL を保持し続ける。コンシューマ（Datastream 等）を
--      接続しないまま放置すると WAL が増え続けディスクを圧迫するため、
--      本マイグレーション適用後は速やかに取り込み側を設定すること。
--   3. スロットを読むロールには REPLICATION 権限が必要。既存の `bq_user` は
--      REPLICATION と public スキーマの SELECT を持つためそのまま利用できる。
--      パブリック版に専用ロールを分けたい場合は別途作成する。

-- トランザクションの制限を避けるため、既存マイグレーションと同様に文ごとに区切る

BEGIN;
-- 1. public スキーマのテーブルのみを対象とする publication（冪等）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'bq_pub_for_all') THEN
        CREATE PUBLICATION bq_pub_for_all FOR TABLES IN SCHEMA public;
    END IF;
END $$;
COMMIT;

BEGIN;
-- 2. パブリック版用の論理レプリケーションスロット（冪等）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_replication_slots WHERE slot_name = 'bq_slot_for_all') THEN
        PERFORM pg_create_logical_replication_slot('bq_slot_for_all', 'pgoutput');
    END IF;
END $$;
COMMIT;

-- 検証クエリ（手動実行用・コメントアウト）:
/*
-- publication の確認（puballtables = false / 対象は public スキーマ）
SELECT pubname, puballtables FROM pg_publication WHERE pubname IN ('bq_pub', 'bq_pub_for_all');

-- publication に含まれるスキーマ
SELECT p.pubname, n.nspname
FROM pg_publication_namespace pn
JOIN pg_publication p ON p.oid = pn.pnpubid
JOIN pg_namespace n ON n.oid = pn.pnnspid
WHERE p.pubname = 'bq_pub_for_all';

-- 実際に配信されるテーブル一覧（user_emails が含まれる点に注意）
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'bq_pub_for_all'
ORDER BY schemaname, tablename;

-- スロットの確認と WAL 保持量
SELECT
    slot_name,
    active,
    pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) AS retained_wal_size
FROM pg_replication_slots
WHERE slot_name IN ('bq_slot', 'bq_slot_for_all');
*/

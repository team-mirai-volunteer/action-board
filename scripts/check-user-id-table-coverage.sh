#!/usr/bin/env bash
set -eo pipefail

# user_id参照テーブルの削除漏れを検出するCIスクリプト
# レビュー対応: マイグレーション追加時に削除漏れが発生しないよう自動検出

echo "=== user_id参照テーブルの削除漏れチェック ==="

# 環境変数チェック
if [ -z "$DATABASE_URL" ]; then
  echo "エラー: DATABASE_URL環境変数が設定されていません"
  exit 1
fi

# 一時ファイルのクリーンアップ
cleanup() {
  rm -f /tmp/all_user_id_tables.txt /tmp/deleted_tables.txt
}
trap cleanup EXIT

# 1. DBスキーマから user_id に対する外部キー制約を持つテーブル名を抽出
echo "📊 データベースから user_id 参照テーブルを抽出中..."
psql "$DATABASE_URL" -Atc "
  SELECT DISTINCT
    kcu.table_name
  FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.constraint_schema = kcu.constraint_schema
  WHERE
    tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'user_id'
    AND kcu.table_schema = 'public';
" | sort > /tmp/all_user_id_tables.txt

# user_idカラムを持つテーブルも追加（外部キー制約がない場合もあるため）
echo "📊 user_idカラムを持つテーブルも追加確認中..."
psql "$DATABASE_URL" -Atc "
  SELECT DISTINCT
    table_name
  FROM
    information_schema.columns
  WHERE
    column_name = 'user_id'
    AND table_schema = 'public';
" | sort >> /tmp/all_user_id_tables.txt

# 重複削除
sort /tmp/all_user_id_tables.txt | uniq > /tmp/all_user_id_tables_unique.txt
mv /tmp/all_user_id_tables_unique.txt /tmp/all_user_id_tables.txt

# 2. マイグレーション内の DELETE 対象テーブルを抽出
echo "📊 マイグレーションファイルから削除対象テーブルを抽出中..."
MIGRATION_FILE="supabase/migrations/20250709000000_add_delete_user_account_function.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "エラー: マイグレーションファイルが見つかりません: $MIGRATION_FILE"
  exit 1
fi

# DELETE FROM文からテーブル名を抽出（WHEREにuser_idを含むもの）
grep -E "DELETE FROM .* WHERE .*user_id" "$MIGRATION_FILE" | \
  grep -oP '(?<=DELETE FROM )\w+' | \
  sort > /tmp/deleted_tables.txt

# 3. 結果表示と差分チェック
echo ""
echo "=== user_id参照テーブル一覧 ==="
cat /tmp/all_user_id_tables.txt

echo ""
echo "=== マイグレーションでDELETE済みテーブル一覧 ==="
cat /tmp/deleted_tables.txt

echo ""
echo "=== マイグレーションで未DELETEのテーブル ==="
MISSING_TABLES=$(comm -23 /tmp/all_user_id_tables.txt /tmp/deleted_tables.txt)

if [ -z "$MISSING_TABLES" ]; then
  echo "✅ 漏れはありません - すべてのuser_id参照テーブルが削除対象に含まれています"
  exit 0
else
  echo "❌ DELETE対象の追加が必要です:"
  echo "$MISSING_TABLES"
  echo ""
  echo "以下のテーブルをマイグレーションファイルに追加してください:"
  echo "$MISSING_TABLES" | while read -r table; do
    echo "  DELETE FROM $table WHERE user_id = target_user_id;"
  done
  exit 1
fi
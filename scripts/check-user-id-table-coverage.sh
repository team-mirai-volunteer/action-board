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
  rm -f /tmp/all_user_id_tables.txt /tmp/deleted_tables.txt /tmp/deleted_tables_regex.txt /tmp/deleted_tables_regex_sorted.txt /tmp/function_exists.txt /tmp/all_user_id_tables_unique.txt
}
trap cleanup EXIT

# 1. DBスキーマから user_id に対する外部キー制約を持つテーブル名を抽出（ビューを除外）
echo "📊 データベースから user_id 参照テーブルを抽出中..."
psql "$DATABASE_URL" -Atc "
  SELECT DISTINCT
    kcu.table_name
  FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.constraint_schema = kcu.constraint_schema
    JOIN information_schema.tables AS t
      ON kcu.table_name = t.table_name
      AND kcu.table_schema = t.table_schema
  WHERE
    tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'user_id'
    AND kcu.table_schema = 'public'
    AND t.table_type = 'BASE TABLE';
" | sort > /tmp/all_user_id_tables.txt

# user_idカラムを持つテーブルも追加（外部キー制約がない場合もあるため、ビューを除外）
echo "📊 user_idカラムを持つテーブルも追加確認中..."
psql "$DATABASE_URL" -Atc "
  SELECT DISTINCT
    c.table_name
  FROM
    information_schema.columns AS c
    JOIN information_schema.tables AS t
      ON c.table_name = t.table_name
      AND c.table_schema = t.table_schema
  WHERE
    c.column_name = 'user_id'
    AND c.table_schema = 'public'
    AND t.table_type = 'BASE TABLE';
" | sort >> /tmp/all_user_id_tables.txt

# 重複削除
sort /tmp/all_user_id_tables.txt | uniq > /tmp/all_user_id_tables_unique.txt
mv /tmp/all_user_id_tables_unique.txt /tmp/all_user_id_tables.txt

# 2. マイグレーション内の DELETE 対象テーブルを抽出
echo "📊 マイグレーションファイルから削除対象テーブルを抽出中..."

# delete_user_account関数を含むマイグレーションファイルを動的に検出
MIGRATION_FILES=$(find supabase/migrations -name "*.sql" -exec grep -l "delete_user_account" {} \; 2>/dev/null | sort)

if [ -z "$MIGRATION_FILES" ]; then
  echo "⚠️  delete_user_account関数を含むマイグレーションファイルが見つかりません"
  echo "📊 全ての.sqlファイルからDELETE文を検索します..."
  
  # フォールバック: 全マイグレーションファイルをチェック
  ALL_MIGRATION_FILES=$(find supabase/migrations -name "*.sql" | sort)
  
  if [ -z "$ALL_MIGRATION_FILES" ]; then
    echo "エラー: supabase/migrations/ディレクトリにマイグレーションファイルが見つかりません"
    exit 1
  fi
  
  MIGRATION_FILES="$ALL_MIGRATION_FILES"
  echo "📋 全マイグレーションファイルを検査対象とします"
else
  echo "📋 delete_user_account関数を含むマイグレーションファイル:"
  echo "$MIGRATION_FILES" | while read -r file; do
    echo "  - $file"
  done
fi

# より堅牢な方法：PostgreSQLのパーサーを使ってDELETE対象テーブルを抽出
echo "📊 PostgreSQLパーサーを使用してDELETE対象テーブルを抽出中..."

# マイグレーションを適用してからpostgresqlのログを解析する方法
# または関数の中身をパースする方法を使用

# まず従来の方法で抽出（改良版の正規表現）
# 全ての関連マイグレーションファイルからDELETE文を抽出
> /tmp/deleted_tables_regex.txt  # ファイルを初期化

echo "$MIGRATION_FILES" | while read -r file; do
  if [ -f "$file" ]; then
    echo "🔍 $file を検査中..."
    DELETE_STATEMENTS=$(sed -n '/DELETE FROM/p' "$file" | grep -E "WHERE .*user_id" || true)
    
    if [ -n "$DELETE_STATEMENTS" ]; then
      echo "  見つかったDELETE文:"
      echo "$DELETE_STATEMENTS" | sed 's/^/    /'
      
      # テーブル名を抽出
      echo "$DELETE_STATEMENTS" | \
        sed -E 's/.*DELETE FROM[[:space:]]+([a-zA-Z_"][a-zA-Z0-9_".-]*)[[:space:]]*WHERE.*/\1/' | \
        sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | \
        sed 's/"//g' >> /tmp/deleted_tables_regex.txt
    fi
  fi
done

# 重複を削除してソート
sort /tmp/deleted_tables_regex.txt | uniq > /tmp/deleted_tables_regex_sorted.txt
mv /tmp/deleted_tables_regex_sorted.txt /tmp/deleted_tables_regex.txt

# PostgreSQLを使った確実な方法：関数定義を実際にパースして検証
echo "📊 PostgreSQL関数定義の妥当性を検証中..."
psql "$DATABASE_URL" -At \
  -c "\\set ON_ERROR_STOP" \
  -c "SELECT routine_name FROM information_schema.routines WHERE routine_name = 'delete_user_account';" > /tmp/function_exists.txt

if [ -s /tmp/function_exists.txt ]; then
  echo "✅ delete_user_account関数が正常に定義されています"
  # 関数の定義から実際のテーブル名を抽出
  psql "$DATABASE_URL" -At \
    -c "\\set ON_ERROR_STOP" \
    -c "SELECT pg_get_functiondef((SELECT oid FROM pg_proc WHERE proname = 'delete_user_account'));" | \
    grep -E "DELETE FROM" | \
    grep -E "user_id" | \
    sed -E 's/.*DELETE FROM[[:space:]]+([a-zA-Z_"][a-zA-Z0-9_".-]*)[[:space:]]*WHERE.*/\1/' | \
    sed 's/"//g' | \
    sort > /tmp/deleted_tables.txt
else
  echo "⚠️  関数が見つからないため、正規表現による抽出結果を使用します"
  cp /tmp/deleted_tables_regex.txt /tmp/deleted_tables.txt
fi

# 結果が空の場合は正規表現の結果を使用
if [ ! -s /tmp/deleted_tables.txt ]; then
  echo "⚠️  PostgreSQL解析が失敗したため、正規表現による抽出結果を使用します"
  cp /tmp/deleted_tables_regex.txt /tmp/deleted_tables.txt
fi

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
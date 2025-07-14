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

# 一時ファイルを安全に作成
ALL_USER_ID_TABLES_FILE=$(mktemp)
DELETED_TABLES_FILE=$(mktemp)
DELETED_TABLES_REGEX_FILE=$(mktemp)
DELETED_TABLES_REGEX_SORTED_FILE=$(mktemp)
FUNCTION_EXISTS_FILE=$(mktemp)
ALL_USER_ID_TABLES_UNIQUE_FILE=$(mktemp)

# 一時ファイルの配列
TEMP_FILES=(
  "$ALL_USER_ID_TABLES_FILE"
  "$DELETED_TABLES_FILE"
  "$DELETED_TABLES_REGEX_FILE"
  "$DELETED_TABLES_REGEX_SORTED_FILE"
  "$FUNCTION_EXISTS_FILE"
  "$ALL_USER_ID_TABLES_UNIQUE_FILE"
)

# 一時ファイルのクリーンアップ
cleanup() {
  rm -f "${TEMP_FILES[@]}"
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
" | sort > "$ALL_USER_ID_TABLES_FILE"

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
" | sort >> "$ALL_USER_ID_TABLES_FILE"

# 重複削除
sort "$ALL_USER_ID_TABLES_FILE" | uniq > "$ALL_USER_ID_TABLES_UNIQUE_FILE"
mv "$ALL_USER_ID_TABLES_UNIQUE_FILE" "$ALL_USER_ID_TABLES_FILE"

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
> "$DELETED_TABLES_REGEX_FILE"  # ファイルを初期化

echo "$MIGRATION_FILES" | while read -r file; do
  if [ -f "$file" ]; then
    echo "🔍 $file を検査中..."
    
    # awk RS=';' を使用して文単位に区切って処理（改行を跨ぐDELETE文に対応）
    DELETE_STATEMENTS=$(awk 'BEGIN{RS=";"} /DELETE[[:space:]]+FROM/ && /user_id/ {gsub(/\n/, " "); print}' "$file")
    
    if [ -n "$DELETE_STATEMENTS" ]; then
      echo "  見つかったDELETE文:"
      echo "$DELETE_STATEMENTS" | sed 's/^/    /'
      
      # PostgreSQLのパーサーを使用してテーブル名を抽出
      echo "$DELETE_STATEMENTS" | while IFS= read -r stmt; do
        if [ -n "$stmt" ]; then
          # PostgreSQLに直接問い合わせてテーブル名を抽出
          table_name=$(psql "$DATABASE_URL" -At -c "
            WITH parsed_query AS (
              SELECT regexp_matches(
                \$stmt\$${stmt}\$stmt\$, 
                'DELETE\s+FROM\s+([\"''']?[a-zA-Z_][a-zA-Z0-9_]*[\"''']?)', 
                'i'
              ) AS table_match
            )
            SELECT 
              CASE 
                WHEN table_match[1] LIKE '\"%\"' THEN trim('\"' from table_match[1])
                WHEN table_match[1] LIKE '''%''' THEN trim('''' from table_match[1])
                ELSE table_match[1]
              END as table_name
            FROM parsed_query
            WHERE table_match IS NOT NULL;
          " 2>/dev/null || echo "")
          
          if [ -n "$table_name" ]; then
            echo "$table_name" >> "$DELETED_TABLES_REGEX_FILE"
          fi
        fi
      done
    fi
  fi
done

# 重複を削除してソート
sort "$DELETED_TABLES_REGEX_FILE" | uniq > "$DELETED_TABLES_REGEX_SORTED_FILE"
mv "$DELETED_TABLES_REGEX_SORTED_FILE" "$DELETED_TABLES_REGEX_FILE"

# PostgreSQLを使った確実な方法：関数定義を実際にパースして検証
echo "📊 PostgreSQL関数定義の妥当性を検証中..."
psql "$DATABASE_URL" -At \
  -c "\\set ON_ERROR_STOP" \
  -c "SELECT routine_name FROM information_schema.routines WHERE routine_name = 'delete_user_account';" > "$FUNCTION_EXISTS_FILE"

if [ -s "$FUNCTION_EXISTS_FILE" ]; then
  echo "✅ delete_user_account関数が正常に定義されています"
  # 関数の定義から実際のテーブル名を抽出（PostgreSQLパーサーを使用）
  psql "$DATABASE_URL" -At \
    -c "\\set ON_ERROR_STOP" \
    -c "
      WITH function_body AS (
        SELECT pg_get_functiondef((SELECT oid FROM pg_proc WHERE proname = 'delete_user_account')) AS func_def
      ),
      delete_statements AS (
        SELECT 
          regexp_split_to_table(func_def, '\n') AS line
        FROM function_body
        WHERE func_def IS NOT NULL
      ),
      filtered_deletes AS (
        SELECT line
        FROM delete_statements
        WHERE line ~* 'DELETE\s+FROM.*user_id'
      ),
      extracted_tables AS (
        SELECT 
          (regexp_matches(line, 'DELETE\s+FROM\s+([\"''']?[a-zA-Z_][a-zA-Z0-9_]*[\"''']?)', 'i'))[1] AS table_match
        FROM filtered_deletes
      )
      SELECT DISTINCT
        CASE 
          WHEN table_match LIKE '\"%\"' THEN trim('\"' from table_match)
          WHEN table_match LIKE '''%''' THEN trim('''' from table_match)
          ELSE table_match
        END as table_name
      FROM extracted_tables
      WHERE table_match IS NOT NULL
      ORDER BY table_name;
    " > "$DELETED_TABLES_FILE"
else
  echo "⚠️  関数が見つからないため、正規表現による抽出結果を使用します"
  cp "$DELETED_TABLES_REGEX_FILE" "$DELETED_TABLES_FILE"
fi

# 結果が空の場合は正規表現の結果を使用
if [ ! -s "$DELETED_TABLES_FILE" ]; then
  echo "⚠️  PostgreSQL解析が失敗したため、正規表現による抽出結果を使用します"
  cp "$DELETED_TABLES_REGEX_FILE" "$DELETED_TABLES_FILE"
fi

# 3. 結果表示と差分チェック
echo ""
echo "=== user_id参照テーブル一覧 ==="
cat "$ALL_USER_ID_TABLES_FILE"

echo ""
echo "=== マイグレーションでDELETE済みテーブル一覧 ==="
cat "$DELETED_TABLES_FILE"

echo ""
echo "=== マイグレーションで未DELETEのテーブル ==="
MISSING_TABLES=$(comm -23 "$ALL_USER_ID_TABLES_FILE" "$DELETED_TABLES_FILE")

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
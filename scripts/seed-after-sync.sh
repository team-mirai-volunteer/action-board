#!/bin/bash
# mission:sync後に実行するシードデータ投入スクリプト
# psqlが存在しない場合はスキップ（オプション扱い）

if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found, skipping seed-after-sync (optional)"
  exit 0
fi

psql -v ON_ERROR_STOP=1 postgresql://postgres:postgres@localhost:54322/postgres -f supabase/seed-after-sync.sql

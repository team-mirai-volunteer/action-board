#!/bin/bash
# SessionEnd hook: MEMORY.mdの差分をstagingファイルに自動キャプチャ
# セッション中にMEMORY.mdに追記された学びを次回/retro用に蓄積する

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo ".")"
# プロジェクトパスからClaude Code memoryディレクトリを動的に導出
# /Users/foo/projects/bar → -Users-foo-projects-bar
PROJECT_ID="$(echo "$REPO_ROOT" | tr '/' '-')"
MEMORY_DIR="$HOME/.claude/projects/$PROJECT_ID/memory"
MEMORY_FILE="$MEMORY_DIR/MEMORY.md"
STAGING="$REPO_ROOT/.claude/tmp/learnings-staging.md"

# MEMORY.mdが存在しなければ終了
[ -f "$MEMORY_FILE" ] || exit 0

# gitで管理されているMEMORY.mdの最終コミット内容と現在の差分を取得
# MEMORY.mdはgit管理外なので、前回のスナップショットと比較する
SNAPSHOT="$REPO_ROOT/.claude/tmp/.memory-snapshot"

if [ -f "$SNAPSHOT" ]; then
  DIFF=$(diff "$SNAPSHOT" "$MEMORY_FILE" 2>/dev/null | grep '^>' | sed 's/^> //')
  if [ -n "$DIFF" ]; then
    mkdir -p "$(dirname "$STAGING")"
    {
      echo ""
      echo "## $(date '+%Y-%m-%d %H:%M') セッション自動キャプチャ"
      echo "$DIFF"
    } >> "$STAGING"
  fi
fi

# 現在のMEMORY.mdをスナップショットとして保存（次回比較用）
mkdir -p "$(dirname "$SNAPSHOT")"
cp "$MEMORY_FILE" "$SNAPSHOT"

#!/bin/bash
# looper/run.sh — 3エージェント並列開発ループ
#
# Planner → Builder(並列) → Verifier の Milestone ループ。
# 判断は全て LLM。スクリプトは worktree 作成とプロセス起動のみ。
# worktree の削除・マージは Verifier エージェントが担当。
#
# 使い方:
#   bash looper/run.sh              # 実行
#   bash looper/run.sh --dry-run    # 実行計画の確認のみ

set -euo pipefail

# スリープ防止（API接続断によるタイムアウトを回避）
caffeinate -s -w $$ &
CAFFEINATE_PID=$!
trap "kill $CAFFEINATE_PID 2>/dev/null" EXIT

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PLAN="$SCRIPT_DIR/milestones.json"
WT_BASE="${RALPH_WORKTREE_BASE:-/tmp/ralph-worktrees}"
LOG_DIR="${RALPH_LOG_DIR:-/tmp/ralph-logs}"
MAX_PARALLEL=${MAX_PARALLEL:-8}
MAX_ROUNDS=${MAX_ROUNDS:-50}
SESSION_TIMEOUT=${RALPH_SESSION_TIMEOUT:-1800}
CLAUDE_MODEL=${CLAUDE_MODEL:-opus}
DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

cd "$PROJECT_ROOT"

log() { echo "[$(TZ=Asia/Tokyo date '+%H:%M:%S')] $*"; }
die() { log "エラー: $*"; exit 1; }

run_claude() {
    local prompt="$1" logfile="$2"
    timeout "$SESSION_TIMEOUT" \
    env CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 \
    claude -p --model "$CLAUDE_MODEL" --verbose --allow-dangerously-skip-permissions --dangerously-skip-permissions \
    --output-format stream-json \
    "$prompt" < /dev/null > "$logfile" 2>&1
}

symlink_node_modules() {
    local wt="$1"
    [ -d "$PROJECT_ROOT/node_modules" ] && ln -sf "$PROJECT_ROOT/node_modules" "$wt/node_modules" 2>/dev/null || true
    for app_nm in "$PROJECT_ROOT"/apps/*/node_modules; do
        [ -d "$app_nm" ] || continue
        local dest_dir="$wt/${app_nm#$PROJECT_ROOT/}"
        dest_dir="$(dirname "$dest_dir")"
        [ -d "$dest_dir" ] && ln -sf "$app_nm" "$dest_dir/node_modules" 2>/dev/null || true
    done
}

# === 前提チェック ===
[ -f "$PLAN" ] || die "$PLAN が見つかりません"
command -v jq &>/dev/null || die "jq が必要です"
command -v claude &>/dev/null || die "claude CLI が必要です"
git diff --quiet HEAD 2>/dev/null || die "未コミットの変更があります。先にコミットしてください。"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
[ "$CURRENT_BRANCH" = "HEAD" ] && die "detached HEAD 状態では実行できません"

mkdir -p "$LOG_DIR" "$WT_BASE"
git worktree prune 2>/dev/null || true

# === サマリー ===
log "=========================================="
log "  Ralph Loop Engine"
log "=========================================="
log "  残り Milestone: $(jq '[.milestones[]|select(.done==false)]|length' "$PLAN")"
log "  モデル:    $CLAUDE_MODEL"
log "  並列上限:  $MAX_PARALLEL"
log "  ログ:      $LOG_DIR"

if $DRY_RUN; then
    jq -r '.milestones[] | "  Milestone \(.milestone): \(if .done then "完了" else .goal end)"' "$PLAN"
    log "ドライラン完了。"
    exit 0
fi

# === Milestone ループ ===
round=0
SOURCE_DOC=$(jq -r '.source // empty' "$PLAN")
for milestone in $(jq -r '.milestones[]|select(.done==false)|.milestone' "$PLAN"); do
    goal=$(jq -r --argjson m "$milestone" '.milestones[]|select(.milestone==$m)|.goal' "$PLAN")
    log "========== Milestone $milestone 開始 =========="
    log "ゴール: $goal"

    # ① Planner
    task_count=$(jq --argjson m "$milestone" '[.milestones[]|select(.milestone==$m)|.tasks[]?]|length' "$PLAN")
    if [ "$task_count" -eq 0 ]; then
        log "Planner: Milestone $milestone の設計ドキュメント作成中..."
        prompt=$(<"$SCRIPT_DIR/prompts/planner.md")
        prompt="${prompt//__MILESTONE__/$milestone}"
        prompt="${prompt//__GOAL__/$goal}"
        prompt="${prompt//__SOURCE_DOC__/${SOURCE_DOC:-}}"
        run_claude "$prompt" "$LOG_DIR/plan-milestone${milestone}.log"
        task_count=$(jq --argjson m "$milestone" '[.milestones[]|select(.milestone==$m)|.tasks[]?]|length' "$PLAN")
        [ "$task_count" -eq 0 ] && die "Planner が Milestone $milestone のタスクを生成しませんでした"
    fi
    # plan_doc を milestones.json から取得（Planner がタイムスタンプ付きパスで保存）
    plan_doc=$(jq -r --argjson m "$milestone" '.milestones[]|select(.milestone==$m)|.plan_doc // empty' "$PLAN")
    [ -z "$plan_doc" ] && die "Milestone $milestone に plan_doc フィールドがありません"
    [ -f "$plan_doc" ] || die "Planner が設計ドキュメント $plan_doc を生成しませんでした"
    log "Planner: ${task_count} タスク + 設計ドキュメント ($plan_doc)"

    # ② ③ Wave ループ
    while true; do
        round=$((round + 1))
        [ "$round" -gt "$MAX_ROUNDS" ] && die "ラウンド上限 ($MAX_ROUNDS) に到達しました"

        wave=$(jq -r --argjson m "$milestone" \
        '.milestones[]|select(.milestone==$m)|[.tasks[]|select(.done==false)|.wave]|min // empty' "$PLAN")
        [ -z "$wave" ] && break

        # 未完了タスク取得
        task_ids=()
        while IFS= read -r tid; do
            [ -n "$tid" ] && task_ids+=("$tid")
            done < <(jq -r --argjson m "$milestone" --argjson w "$wave" \
        '.milestones[]|select(.milestone==$m)|.tasks[]|select(.wave==$w and .done==false)|.id' "$PLAN")

        batch=("${task_ids[@]:0:$MAX_PARALLEL}")
        log "Wave $wave: ${batch[*]} (${#batch[@]} 並列)"

        # worktree 作成 + Builder 並列実行
        builder_prompt_tpl=$(<"$SCRIPT_DIR/prompts/builder.md")
        builder_pids=()
        for id in "${batch[@]}"; do
            wt="$WT_BASE/$id"
            git worktree remove "$wt" --force 2>/dev/null || true
            git branch -D "worktree/$id" 2>/dev/null || true
            git worktree add -b "worktree/$id" "$wt" HEAD || { log "worktree 作成失敗: $id（スキップ）"; continue; }
            symlink_node_modules "$wt"

            desc=$(jq -r --argjson m "$milestone" --arg id "$id" \
            '.milestones[]|select(.milestone==$m)|.tasks[]|select(.id==$id)|.description' "$PLAN")
            prompt="${builder_prompt_tpl//__TASK_ID__/$id}"
            prompt="${prompt//__TASK_DESC__/$desc}"
            prompt="${prompt//__PLAN_DOC__/$plan_doc}"

            log "Builder: $id 起動"
            (cd "$wt" && run_claude "$prompt" "$LOG_DIR/$id.log") &
            builder_pids+=($!)
        done
        wait "${builder_pids[@]}"
        log "Builder: 全セッション完了"

        # コミットのあるブランチだけ Verifier に渡す
        verified_branches=()
        for id in "${batch[@]}"; do
            if git rev-list --count "HEAD..worktree/$id" 2>/dev/null | grep -qv '^0$'; then
                verified_branches+=("$id")
            else
                log "Builder: $id はコミットなし（スキップ）"
            fi
        done
        [ ${#verified_branches[@]} -eq 0 ] && { log "Verifier: マージ対象なし（スキップ）"; continue; }
        branch_list=$(printf "worktree/%s " "${verified_branches[@]}")
        verifier_prompt=$(<"$SCRIPT_DIR/prompts/verifier.md")
        verifier_prompt="${verifier_prompt//__BRANCHES__/$branch_list}"
        verifier_prompt="${verifier_prompt//__MILESTONE__/$milestone}"
        log "Verifier: マージ・検証中..."
        run_claude "$verifier_prompt" "$LOG_DIR/verify-milestone${milestone}-w${wave}.log"
        log "Verifier: セッション完了"
    done

    milestone_done=$(jq -r --argjson m "$milestone" '.milestones[]|select(.milestone==$m)|.done' "$PLAN")
    if [ "$milestone_done" = "true" ]; then
        log "========== Milestone $milestone 完了 =========="
    else
        die "Milestone $milestone が完了しませんでした。ログを確認: $LOG_DIR"
    fi
done

log "全 Milestone 完了 ($round ラウンド)"

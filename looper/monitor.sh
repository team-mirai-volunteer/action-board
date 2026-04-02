#!/bin/bash
# looper/monitor.sh — Builder セッションのリアルタイム監視
#
# 使い方:
#   watch -n3 bash looper/monitor.sh          # 3秒ごとに自動更新（簡易表示）
#   watch -n3 bash looper/monitor.sh -v       # 3秒ごとに自動更新（詳細表示）
#   bash looper/monitor.sh                    # 1回だけ表示
#   bash looper/monitor.sh 30                 # 直近30分のログのみ（デフォルト10分）
#   bash looper/monitor.sh -v 30              # 詳細 + 直近30分

LOG_DIR="${RALPH_LOG_DIR:-/tmp/ralph-logs}"
VERBOSE=false

# 引数パース
while [[ $# -gt 0 ]]; do
	case "$1" in
		-v|--verbose) VERBOSE=true; shift ;;
		*) MINUTES="$1"; shift ;;
	esac
done
MINUTES="${MINUTES:-10}"

echo "=== Ralph Monitor (直近 ${MINUTES} 分) ==="
echo ""

found=false
for logfile in $(find "$LOG_DIR" -name '*.log' -mmin "-$MINUTES" -print0 | xargs -0 stat -f '%m %N' | sort -n | awk '{print $2}'); do
	[ -f "$logfile" ] || continue
	found=true
	name=$(basename "$logfile" .log)
	size=$(wc -c < "$logfile" | tr -d ' ')
	updated=$(stat -f '%Sm' -t '%H:%M:%S' "$logfile" 2>/dev/null || stat -c '%y' "$logfile" 2>/dev/null | cut -d. -f1)

	# 最後の assistant イベントからアクティビティを抽出
	last_activity=$(tail -30 "$logfile" | jq -r '
		select(.type == "assistant") |
		.message.content[]? |
		if .type == "tool_use" then
			"[" + .name + "] " + (
				.input |
				if .file_path then (.file_path | split("/") | last)
				elif .command then (.command | split("\n") | first | .[0:50])
				elif .pattern then .pattern
				elif .content then "writing..."
				elif .todos then "updating..."
				else ""
				end
			)
		elif .type == "text" then
			(.text | split("\n") | first | .[0:70])
		else empty
		end
	' 2>/dev/null | tail -1)

	[ -z "$last_activity" ] && last_activity="(stream-json 以前のログ)"

	printf "  %-40s %s  %4dKB  %s\n" "$name" "$updated" "$((size / 1024))" "$last_activity"

	# -v: 詳細表示
	if $VERBOSE; then
		# TODO 進捗 (最後の TodoWrite のみ取得)
		# 各 TodoWrite の todos を "---" 区切りブロックとして出力し、最後のブロックだけ取る
		todos=$(jq -r '
			select(.type == "assistant") |
			.message.content[]? |
			select(.type == "tool_use" and .name == "TodoWrite") |
			"---",
			(.input.todos[]? |
				if .status == "completed" then "✓ " + .content
				elif .status == "in_progress" then "▶ " + .content
				else "  " + .content
				end
			)
		' "$logfile" 2>/dev/null | awk '/^---$/{block=""; next} {block=block (block?"\n":"") $0} END{print block}')

		if [ -n "$todos" ]; then
			# completed / total を集計
			total=$(echo "$todos" | wc -l | tr -d ' ')
			done_count=$(echo "$todos" | grep -c '^✓' || true)
			printf "    ┌ TODO: %d/%d " "$done_count" "$total"
			# プログレスバー
			if [ "$total" -gt 0 ]; then
				pct=$((done_count * 100 / total))
				filled=$((pct / 5))
				empty=$((20 - filled))
				bar=""
				for ((i=0; i<filled; i++)); do bar+="█"; done
				for ((i=0; i<empty; i++)); do bar+="░"; done
				printf "[%s] %d%%\n" "$bar" "$pct"
			else
				printf "\n"
			fi
			echo "$todos" | while IFS= read -r line; do
				printf "    │ %s\n" "$line"
			done
		fi

		# 直近のツール使用サマリ (最新50イベントから)
		tool_summary=$(tail -200 "$logfile" | jq -r '
			select(.type == "assistant") |
			.message.content[]? |
			select(.type == "tool_use") | .name
		' 2>/dev/null | sort | uniq -c | sort -rn | head -5)

		if [ -n "$tool_summary" ]; then
			printf "    ┌ Tools: "
			echo "$tool_summary" | awk '{printf "%s(%s) ", $2, $1}' | sed 's/ $//'
			printf "\n"
		fi

		# エラー検出
		errors=$(tail -100 "$logfile" | jq -r '
			select(.type == "result" and .subtype == "error") |
			.error // empty
		' 2>/dev/null | tail -1)

		if [ -n "$errors" ]; then
			printf "    ┌ ⚠ ERROR: %s\n" "$(echo "$errors" | head -c 80)"
		fi

		echo ""
	fi
done

if ! $found; then
	echo "  (アクティブなログなし)"
fi

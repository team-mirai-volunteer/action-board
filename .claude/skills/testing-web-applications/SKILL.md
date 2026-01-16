---
name: Testing web applications
description: Executes browser-based QA tests using agent-browser CLI, covering happy paths and error paths. Use when testing web apps, verifying UI behavior, running E2E tests, or capturing screenshots on localhost.
---

# Testing Web Applications

agent-browser CLI を使用したブラウザQAテスト実行スキル。

## Prerequisites

```bash
# インストール確認
agent-browser --version

# 未インストールの場合
npm install -g agent-browser && agent-browser install
```

## Workflow

以下のチェックリストをコピーして進捗を追跡:

```
QA Test Progress:
- [ ] Phase 1: 環境準備（ページを開きスナップショット取得）
- [ ] Phase 2: 正常系テスト実行
- [ ] Phase 3: 異常系テスト実行
- [ ] Phase 4: レポート生成
```

### Phase 1: 環境準備

```bash
agent-browser open "http://localhost:3000"
agent-browser snapshot -i  # インタラクティブ要素のみ取得（@e1, @e2 等）
agent-browser screenshot initial-state.png
```

### Phase 2: 正常系テスト

有効な入力での期待動作を確認。各ステップでスクリーンショット取得。

### Phase 3: 異常系テスト

- 無効入力（空文字、特殊文字、境界値超過）
- エラーメッセージ表示
- XSS/SQLインジェクション防御

### Phase 4: レポート生成

`docs/qa-reports/YYYY-MM-DD-<feature>.md` に保存。

## agent-browser Quick Reference

| 操作 | コマンド |
|------|---------|
| ページを開く | `agent-browser open "URL"` |
| スナップショット | `agent-browser snapshot -i` |
| クリック | `agent-browser click @e1` |
| 入力 | `agent-browser fill @e1 "text"` |
| スクリーンショット | `agent-browser screenshot file.png` |
| キー押下 | `agent-browser press Enter` |
| 待機 | `agent-browser wait 2s` / `wait --network-idle` |
| セッション維持 | `agent-browser --session qa open "URL"` |

**要素参照**: `snapshot -i` で取得した `@e1`, `@e2` 等を使用。

## Test Types

| タイプ | 参照 |
|--------|------|
| 機能テスト | [references/functional-testing.md](references/functional-testing.md) |
| UIテスト | [references/ui-testing.md](references/ui-testing.md) |
| E2Eフロー | [references/e2e-testing.md](references/e2e-testing.md) |
| 回帰テスト | [references/regression-testing.md](references/regression-testing.md) |

## Report Template

```markdown
# QA Test Report: [Feature Name]

## Summary
| Total | Passed | Failed | Skipped |
|-------|--------|--------|---------|
| X     | X      | X      | X       |

## Environment
- URL: [target URL]
- Browser: Chromium (agent-browser)
- Date: YYYY-MM-DD

## Test Results

### TC-001: [Test Name]
- **Status**: PASS/FAIL
- **Type**: functional/ui/e2e/regression
- **Category**: positive/negative
- **Expected**: Expected result
- **Actual**: Actual result
- **Screenshots**: [links]

## Issues Found
| ID | Severity | Description | Screenshot |
|----|----------|-------------|------------|

## Recommendations
- [Improvement suggestions]
```

## agent-browser Tips

- `snapshot -i` を常に使用（インタラクティブ要素のみ）
- 要素参照 `@e1` は決定論的（DOM再クエリ不要）
- `--session` フラグで認証状態を維持
- `--headed` でブラウザ表示（デバッグ用）

# Regression Testing Guide

回帰テストは、新しい変更が既存機能を破壊していないことを検証する。

## 目次

1. [回帰テストの原則](#回帰テストの原則)
2. [スモークテスト](#スモークテスト)
3. [フル回帰テスト](#フル回帰テスト)
4. [変更影響分析](#変更影響分析)
5. [テスト優先度マトリクス](#テスト優先度マトリクス)

## 回帰テストの原則

### いつ実行するか

1. **コードマージ前**: PR/MRの一部として
2. **デプロイ前**: ステージング環境での確認
3. **定期実行**: 毎日/毎週のスケジュール実行
4. **ホットフィックス後**: 緊急修正の影響確認

### テスト選択戦略

```
変更規模 → テスト範囲
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
小規模修正   → スモークテスト + 関連機能
機能追加     → スモーク + 影響範囲 + 新機能
大規模変更   → フル回帰テスト
リリース前   → フル回帰テスト + E2E
```

## スモークテスト

### 目的

最も重要な機能が動作することを迅速に確認する。
実行時間: 5-10分以内

### スモークテストセット

```yaml
SMOKE-001:
  name: アプリケーション起動確認
  priority: critical
  commands:
    - agent-browser open "http://localhost:3000"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → ページが正常にロード、エラーなしを確認
    - agent-browser screenshot smoke-001-home.png
  timeout: 30s

SMOKE-002:
  name: 認証機能確認
  priority: critical
  commands:
    - agent-browser open "http://localhost:3000/login"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → @e1: Email input, @e2: Password input, @e3: Login button
    - agent-browser fill @e1 "test@example.com"
    - agent-browser fill @e2 "password123"
    - agent-browser click @e3
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → ダッシュボードにログイン成功を確認
    - agent-browser screenshot smoke-002-login.png
  timeout: 30s

SMOKE-003:
  name: 主要ナビゲーション確認
  priority: critical
  preconditions: ログイン済み
  commands:
    - agent-browser snapshot -i
      # → @e1: Home link, @e2: Settings link, @e3: Profile link
    - agent-browser click @e1
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → ホーム画面表示を確認
    - agent-browser click @e2
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 設定画面表示を確認
    - agent-browser click @e3
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → プロフィール画面表示を確認
  timeout: 30s

SMOKE-004:
  name: データ表示確認
  priority: critical
  commands:
    - agent-browser open "http://localhost:3000/items"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → データ一覧が表示されることを確認
    - agent-browser screenshot smoke-004-items.png
  timeout: 30s

SMOKE-005:
  name: 基本CRUD確認（作成）
  priority: critical
  commands:
    - agent-browser open "http://localhost:3000/items"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → @e1: Add button
    - agent-browser click @e1
    - agent-browser wait 1s
    - agent-browser snapshot -i
      # → @e2: Title input, @e3: Save button
    - agent-browser fill @e2 "Smoke Test Item"
    - agent-browser click @e3
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 作成成功、一覧に表示を確認
    - agent-browser screenshot smoke-005-created.png
  timeout: 60s

SMOKE-006:
  name: API接続確認
  priority: critical
  commands:
    - agent-browser open "http://localhost:3000/api-dependent-page"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → APIからデータ取得、表示成功を確認
    - agent-browser screenshot smoke-006-api.png
  timeout: 30s
```

### スモークテスト実行フロー

```bash
# スモークテスト実行
# 各テストを順番に実行し、失敗があれば即座に停止

# SMOKE-001: アプリケーション起動確認
agent-browser open "http://localhost:3000"
agent-browser wait --network-idle
agent-browser snapshot -i
agent-browser screenshot smoke-001.png

# SMOKE-002: 認証機能確認
agent-browser open "http://localhost:3000/login"
agent-browser snapshot -i
agent-browser fill @e1 "test@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3
agent-browser wait --network-idle
agent-browser snapshot -i
# 失敗した場合
# agent-browser screenshot smoke-fail-002.png
# レポート生成後、即座に停止

# 成功した場合、次のテストへ...
```

## フル回帰テスト

### テストスイート構成

```yaml
REGRESSION_SUITES:
  authentication:
    tests:
      - REG-AUTH-001: ログイン
      - REG-AUTH-002: ログアウト
      - REG-AUTH-003: パスワードリセット
      - REG-AUTH-004: 登録
      - REG-AUTH-005: セッション管理
    estimated_time: 10min

  user_management:
    tests:
      - REG-USER-001: プロフィール表示
      - REG-USER-002: プロフィール編集
      - REG-USER-003: パスワード変更
      - REG-USER-004: アカウント削除
    estimated_time: 8min

  core_features:
    tests:
      - REG-CORE-001: アイテム作成
      - REG-CORE-002: アイテム表示
      - REG-CORE-003: アイテム編集
      - REG-CORE-004: アイテム削除
      - REG-CORE-005: 検索機能
      - REG-CORE-006: フィルタ機能
      - REG-CORE-007: ソート機能
    estimated_time: 15min

  ui_components:
    tests:
      - REG-UI-001: ナビゲーション
      - REG-UI-002: モーダル
      - REG-UI-003: フォーム
      - REG-UI-004: テーブル
      - REG-UI-005: ページネーション
    estimated_time: 12min

  integrations:
    tests:
      - REG-INT-001: 外部API連携
      - REG-INT-002: ファイルアップロード
      - REG-INT-003: 通知機能
    estimated_time: 10min
```

### 回帰テストケース例

```yaml
REG-AUTH-001:
  name: ログイン機能回帰テスト
  suite: authentication
  commands:
    # 正常系
    - agent-browser open "http://localhost:3000/login"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → @e1: Email, @e2: Password, @e3: Login button
    - agent-browser fill @e1 "valid@example.com"
    - agent-browser fill @e2 "ValidPass123!"
    - agent-browser click @e3
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → ログイン成功を確認

    # ログアウト
    - agent-browser snapshot -i
      # → @e4: Logout button
    - agent-browser click @e4
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → ログアウト成功を確認

    # 異常系
    - agent-browser open "http://localhost:3000/login"
    - agent-browser snapshot -i
    - agent-browser fill @e1 "invalid@example.com"
    - agent-browser fill @e2 "wrong"
    - agent-browser click @e3
    - agent-browser wait 2s
    - agent-browser snapshot -i
      # → エラーメッセージ表示を確認

REG-CORE-001:
  name: アイテム作成回帰テスト
  suite: core_features
  preconditions:
    - ログイン済み
  commands:
    # 作成フォーム表示
    - agent-browser open "http://localhost:3000/items"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → @e1: Add button
    - agent-browser click @e1
    - agent-browser wait 1s
    - agent-browser snapshot -i
      # → 作成フォーム表示を確認
      # → @e2: Title, @e3: Description, @e4: Save button

    # 必須フィールド入力
    - agent-browser fill @e2 "Regression Test Item"
    - agent-browser fill @e3 "テスト用アイテム"

    # 保存
    - agent-browser click @e4
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 保存成功、一覧に表示を確認
      # → @e5: Created item

    # 作成したアイテムを確認
    - agent-browser click @e5
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 詳細が正しく表示を確認
      # → @e6: Delete button

    # クリーンアップ
    - agent-browser click @e6
    - agent-browser wait 0.5s
    - agent-browser snapshot -i
      # → @e7: Confirm button
    - agent-browser click @e7
    - agent-browser wait --network-idle
```

## 変更影響分析

### 影響マッピング

```yaml
IMPACT_MAP:
  authentication:
    affected_by:
      - auth module changes
      - session management changes
      - user model changes
    affects:
      - all protected routes
      - user-specific features
    tests_required:
      - SMOKE-002
      - REG-AUTH-*
      - E2E-ONBOARD-001

  api_layer:
    affected_by:
      - API endpoint changes
      - request/response format changes
      - error handling changes
    affects:
      - all data-fetching components
      - forms
    tests_required:
      - SMOKE-006
      - REG-CORE-*

  ui_components:
    affected_by:
      - component library updates
      - CSS/style changes
      - layout changes
    affects:
      - visual appearance
      - responsive behavior
    tests_required:
      - REG-UI-*
      - responsive tests
```

### 変更タイプ別テスト選択

```yaml
CHANGE_BASED_TESTING:
  bug_fix:
    scope: minimal
    tests:
      - related_smoke_tests
      - specific_regression_tests
      - bug_reproduction_test

  feature_addition:
    scope: moderate
    tests:
      - all_smoke_tests
      - related_suite_tests
      - new_feature_tests
      - integration_tests

  refactoring:
    scope: comprehensive
    tests:
      - all_smoke_tests
      - affected_suite_tests
      - performance_comparison

  dependency_update:
    scope: full
    tests:
      - full_regression_suite
      - compatibility_tests

  release:
    scope: complete
    tests:
      - full_regression_suite
      - all_e2e_tests
      - cross_browser_tests
```

## テスト優先度マトリクス

### 優先度の決定基準

| 要素 | 高優先度 | 中優先度 | 低優先度 |
|------|----------|----------|----------|
| ビジネス影響 | 収益直結 | 主要機能 | 補助機能 |
| 使用頻度 | 毎日使用 | 週次使用 | 稀に使用 |
| バグ履歴 | 頻繁に問題 | 時々問題 | 安定 |
| 変更頻度 | よく変更 | 時々変更 | 稀に変更 |

### 優先度マトリクス

```yaml
PRIORITY_MATRIX:
  P1_critical:
    description: "必ず実行（スモークテスト）"
    execution: always
    tests:
      - ログイン/ログアウト
      - 主要データ表示
      - 決済フロー（該当する場合）

  P2_high:
    description: "機能変更時に実行"
    execution: on_related_changes
    tests:
      - CRUD操作全般
      - 検索/フィルタ
      - ユーザー管理

  P3_medium:
    description: "リリース前に実行"
    execution: pre_release
    tests:
      - UI一貫性
      - エラーハンドリング
      - エッジケース

  P4_low:
    description: "定期実行"
    execution: scheduled
    tests:
      - 互換性テスト
      - パフォーマンステスト
      - アクセシビリティ詳細
```

## レポートフォーマット

```markdown
# Regression Test Report

## Execution Summary
| Metric | Value |
|--------|-------|
| Total Tests | X |
| Passed | X |
| Failed | X |
| Skipped | X |
| Duration | Xm Xs |
| Date | YYYY-MM-DD |

## Test Suites

### Authentication Suite
| Test ID | Name | Status | Duration |
|---------|------|--------|----------|
| REG-AUTH-001 | ログイン | PASS | 5s |
| REG-AUTH-002 | ログアウト | PASS | 3s |

### Core Features Suite
| Test ID | Name | Status | Duration |
|---------|------|--------|----------|
| REG-CORE-001 | アイテム作成 | FAIL | 8s |

## Failed Tests Detail

### REG-CORE-001: アイテム作成
- **Error**: 保存ボタンが反応しない
- **Step Failed**: `agent-browser click @e4`
- **Expected**: 保存成功メッセージ
- **Actual**: タイムアウト
- **Screenshot**: [reg-core-001-fail.png]

## Comparison with Previous Run

| Metric | Previous | Current | Change |
|--------|----------|---------|--------|
| Pass Rate | 98% | 95% | -3% |
| New Failures | - | 2 | +2 |
| Fixed | - | 1 | +1 |

## Recommendations
1. REG-CORE-001の失敗を調査
2. 関連するE2Eテストも確認
```

## 実行パターン

```bash
# 1. スモークテスト実行
# セッションを使用して認証状態を維持
agent-browser --session regression open "http://localhost:3000"
agent-browser --session regression wait --network-idle
agent-browser --session regression screenshot smoke-home.png

# ログイン
agent-browser --session regression open "http://localhost:3000/login"
agent-browser --session regression snapshot -i
agent-browser --session regression fill @e1 "test@example.com"
agent-browser --session regression fill @e2 "password123"
agent-browser --session regression click @e3
agent-browser --session regression wait --network-idle

# スモーク成功後、フル回帰へ

# 2. 各スイートのテストを実行
# Authentication Suite
agent-browser --session regression open "http://localhost:3000/login"
# ... テスト実行 ...

# 失敗時はスクリーンショット保存
agent-browser --session regression screenshot fail-REG-AUTH-001.png

# 3. テスト完了後、ブラウザを閉じる
agent-browser --session regression close

# 4. レポート生成
# テスト結果を集計してMarkdownレポートを作成
```

## 並列実行

複数のテストスイートを並列で実行する場合:

```bash
# セッション1: Authentication Suite
agent-browser --session auth-suite open "http://localhost:3000"
# ... 認証関連テスト ...

# セッション2: Core Features Suite (同時実行)
agent-browser --session core-suite open "http://localhost:3000"
# ... コア機能テスト ...

# セッション3: UI Components Suite (同時実行)
agent-browser --session ui-suite open "http://localhost:3000"
# ... UIテスト ...

# 各セッションの結果を集約してレポート生成
```

## ベストプラクティス

1. **セッション管理**: `--session` フラグを使用してテスト間で認証状態を維持
2. **失敗時のスクリーンショット**: 失敗したステップで必ずスクリーンショットを保存
3. **タイムアウト設定**: 各テストに適切なタイムアウトを設定
4. **並列実行**: 独立したテストスイートは並列セッションで実行
5. **クリーンアップ**: テスト後はテストデータをクリーンアップ
6. **状態保存**: 認証状態を `agent-browser state save` で保存し再利用

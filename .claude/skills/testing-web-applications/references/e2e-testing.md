# E2E Testing Guide

E2E（End-to-End）テストは、ユーザージャーニー全体を通して検証する。

## 目次

1. [E2Eテストの原則](#e2eテストの原則)
2. [共通ユーザーフロー](#共通ユーザーフロー)
3. [シナリオテンプレート](#シナリオテンプレート)
4. [異常系E2Eテスト](#異常系e2eテスト)

## E2Eテストの原則

### クリティカルパス優先

1. **収益に直結するフロー**: 購入、決済、サブスクリプション
2. **ユーザー獲得フロー**: 登録、オンボーディング
3. **コア機能フロー**: アプリの主要価値提供機能
4. **リテンションフロー**: 通知設定、リマインダー

### テスト設計ガイドライン

- 1シナリオ = 1ユーザーゴール
- 実際のユーザー行動を模倣
- 各ステップでアサーション（検証）
- 失敗時は詳細ログとスクリーンショット

## 共通ユーザーフロー

### 新規ユーザー登録フロー

```yaml
E2E-ONBOARD-001:
  name: 新規ユーザー登録〜初回利用
  priority: critical

  commands:
    - agent-browser open "http://localhost:3000"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → ランディングページが表示されることを確認
    - agent-browser screenshot e2e-landing.png

    - agent-browser snapshot -i
      # → @e1: Sign up button
    - agent-browser click @e1
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 登録フォーム表示を確認
      # → @e2: Email, @e3: Password, @e4: Confirm password
      # → @e5: Terms checkbox, @e6: Register button

    - agent-browser fill @e2 "newuser@example.com"
    - agent-browser fill @e3 "SecurePass123!"
    - agent-browser fill @e4 "SecurePass123!"
    - agent-browser check @e5
    - agent-browser click @e6
    - agent-browser wait --network-idle
    - agent-browser screenshot e2e-registered.png

    - agent-browser snapshot -i
      # → オンボーディング画面 or ダッシュボードを確認
    - agent-browser screenshot e2e-onboarding.png

  postconditions:
    - ユーザーアカウントが作成されている
    - ログイン状態が維持される
    - ウェルカムメールが送信される（確認可能な場合）
```

### ログイン〜主要機能利用フロー

```yaml
E2E-CORE-001:
  name: ログイン〜コア機能実行
  priority: critical

  preconditions:
    - 登録済みアカウントが存在
    - テストデータが準備済み

  commands:
    - agent-browser open "http://localhost:3000/login"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → @e1: Email, @e2: Password, @e3: Login button

    - agent-browser fill @e1 "testuser@example.com"
    - agent-browser fill @e2 "TestPass123!"
    - agent-browser click @e3
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → ダッシュボードに遷移を確認
    - agent-browser screenshot e2e-login-success.png

    - agent-browser snapshot -i
      # → @e4: New item button
    - agent-browser click @e4
    - agent-browser wait 1s
    - agent-browser snapshot -i
      # → 作成フォーム表示を確認
      # → @e5: Title, @e6: Save button

    - agent-browser fill @e5 "E2Eテストアイテム"
    - agent-browser click @e6
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 保存成功メッセージを確認
      # → 一覧に新規アイテムが表示されることを確認
    - agent-browser screenshot e2e-item-created.png

  postconditions:
    - アイテムがデータベースに保存されている
    - 一覧画面に表示される
```

### 購入/決済フロー

```yaml
E2E-PURCHASE-001:
  name: 商品購入フロー
  priority: critical

  preconditions:
    - ログイン済み
    - 購入可能な商品が存在

  commands:
    - agent-browser open "http://localhost:3000/products"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 商品一覧が表示されることを確認
      # → @e1: Product card
    - agent-browser click @e1
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 商品詳細画面を確認
      # → @e2: Add to cart button
    - agent-browser screenshot e2e-product-detail.png

    - agent-browser click @e2
    - agent-browser wait 1s
    - agent-browser snapshot -i
      # → カートアイコンに数量表示を確認
      # → @e3: Cart icon
    - agent-browser click @e3
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → カート画面表示を確認
      # → @e4: Checkout button

    - agent-browser click @e4
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 決済情報入力画面を確認
      # → @e5: Card number, @e6: Expiry, @e7: CVC, @e8: Pay button
    - agent-browser screenshot e2e-checkout.png

    - agent-browser fill @e5 "4242424242424242"
    - agent-browser fill @e6 "12/25"
    - agent-browser fill @e7 "123"
    - agent-browser click @e8
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 注文完了画面、注文番号表示を確認
    - agent-browser screenshot e2e-order-complete.png

  postconditions:
    - 注文履歴に記録される
    - 確認メールが送信される
    - 在庫が減少する
```

### 検索・フィルタフロー

```yaml
E2E-SEARCH-001:
  name: 検索〜結果絞り込み〜詳細表示
  priority: high

  commands:
    - agent-browser open "http://localhost:3000"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → @e1: Search icon
    - agent-browser click @e1
    - agent-browser wait 0.5s
    - agent-browser snapshot -i
      # → 検索入力フィールド表示を確認
      # → @e2: Search textbox

    - agent-browser fill @e2 "テスト商品"
    - agent-browser press Enter
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 検索結果表示を確認
      # → @e3: Category filter
    - agent-browser screenshot e2e-search-results.png

    - agent-browser click @e3
    - agent-browser wait 0.5s
    - agent-browser snapshot -i
      # → フィルタオプション表示を確認
      # → @e4: Category A option
    - agent-browser click @e4
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 結果が絞り込まれることを確認
      # → @e5: Sort dropdown

    - agent-browser click @e5
    - agent-browser wait 0.5s
    - agent-browser snapshot -i
      # → @e6: Price low to high option
    - agent-browser click @e6
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 価格順でソートされることを確認
      # → @e7: First result item

    - agent-browser click @e7
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 詳細画面に遷移を確認
    - agent-browser screenshot e2e-search-detail.png
```

### プロフィール編集フロー

```yaml
E2E-PROFILE-001:
  name: プロフィール編集〜保存
  priority: medium

  preconditions:
    - ログイン済み

  commands:
    - agent-browser open "http://localhost:3000"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → @e1: User menu
    - agent-browser click @e1
    - agent-browser wait 0.5s
    - agent-browser snapshot -i
      # → @e2: Profile settings
    - agent-browser click @e2
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → プロフィール編集画面を確認
      # → @e3: Display name textbox, @e4: Save button

    - agent-browser fill @e3 "更新された名前"
    - agent-browser click @e4
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 保存成功メッセージを確認
      # → 更新された名前が表示されることを確認
    - agent-browser screenshot e2e-profile-updated.png
```

## シナリオテンプレート

### 基本テンプレート

```yaml
E2E-XXX-NNN:
  name: シナリオ名
  description: シナリオの目的
  priority: critical | high | medium | low

  preconditions:
    - 前提条件1
    - 前提条件2

  test_data:
    user_email: "test@example.com"
    user_password: "TestPass123"

  commands:
    - agent-browser open "<URL>"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 要素参照を取得
    - agent-browser fill @e1 "<入力テキスト>"
    - agent-browser click @e2
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 期待結果を確認
    - agent-browser screenshot <screenshot-name>.png

  postconditions:
    - 事後状態1

  cleanup:
    - テストデータのクリーンアップ手順
```

### データ駆動テンプレート

```yaml
E2E-DATA-DRIVEN:
  name: データ駆動E2Eテスト

  test_data_sets:
    - name: "通常ユーザー"
      email: "normal@example.com"
      expected_role: "user"
    - name: "管理者ユーザー"
      email: "admin@example.com"
      expected_role: "admin"

  commands:
    # 各テストデータセットで以下を実行
    - agent-browser open "http://localhost:3000/login"
    - agent-browser snapshot -i
    - agent-browser fill @e1 "{test_data.email}"
    - agent-browser fill @e2 "password123"
    - agent-browser click @e3
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → {test_data.expected_role}の権限で表示されることを確認
```

## 異常系E2Eテスト

### ネットワークエラーリカバリー

```yaml
E2E-ERR-001:
  name: ネットワークエラー時のリカバリー
  description: ネットワーク障害発生時のユーザー体験を検証

  commands:
    - agent-browser open "http://localhost:3000/dashboard"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → ダッシュボード表示を確認

    # ネットワーク切断をシミュレート（アプリ側でオフラインモードをトリガー）
    - agent-browser snapshot -i
      # → @e1: Refresh data button
    - agent-browser click @e1
    - agent-browser wait 2s
    - agent-browser snapshot -i
      # → オフラインエラーメッセージ表示を確認
    - agent-browser screenshot e2e-offline-error.png

    # ネットワーク復旧後
    - agent-browser snapshot -i
      # → @e2: Retry button
    - agent-browser click @e2
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → データが正常に読み込まれることを確認
    - agent-browser screenshot e2e-recovered.png
```

### セッションタイムアウトリカバリー

```yaml
E2E-ERR-002:
  name: セッション切れ後のリカバリー

  commands:
    # 事前ログイン
    - agent-browser open "http://localhost:3000/login"
    - agent-browser snapshot -i
    - agent-browser fill @e1 "test@example.com"
    - agent-browser fill @e2 "password123"
    - agent-browser click @e3
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → ダッシュボード表示を確認

    # セッションタイムアウトをシミュレート（待機または手動トリガー）

    - agent-browser snapshot -i
      # → @e4: Any action button
    - agent-browser click @e4
    - agent-browser wait 2s
    - agent-browser snapshot -i
      # → セッション切れメッセージまたはログイン画面を確認
    - agent-browser screenshot e2e-session-expired.png

    # 再ログイン
    - agent-browser snapshot -i
    - agent-browser fill @e1 "test@example.com"
    - agent-browser fill @e2 "password123"
    - agent-browser click @e3
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 再度ダッシュボードに戻れることを確認
```

### フォーム入力エラーリカバリー

```yaml
E2E-ERR-003:
  name: 入力エラー後の修正・再送信

  commands:
    - agent-browser open "http://localhost:3000/form"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → @e1: Email textbox, @e2: Submit button

    - agent-browser fill @e1 "invalid-email"
    - agent-browser click @e2
    - agent-browser wait 1s
    - agent-browser snapshot -i
      # → バリデーションエラー表示を確認
    - agent-browser screenshot e2e-validation-error.png

    - agent-browser fill @e1 "valid@example.com"
    - agent-browser click @e2
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 送信成功を確認
    - agent-browser screenshot e2e-form-success.png
```

## 実行ワークフロー

```bash
# 1. テスト開始
agent-browser open "http://localhost:3000"
agent-browser wait --network-idle
agent-browser screenshot e2e-start.png

# 2. ログインフロー
agent-browser snapshot -i
# → @e1: Email, @e2: Password, @e3: Login button
agent-browser fill @e1 "test@example.com"
agent-browser fill @e2 "password"
agent-browser click @e3
agent-browser wait --network-idle

# 3. 結果確認
agent-browser snapshot -i
# → ダッシュボードが表示されることを確認
agent-browser screenshot e2e-login-success.png

# 4. コア機能実行
agent-browser snapshot -i
# → @e4: New item button, など
agent-browser click @e4
agent-browser wait 1s
agent-browser snapshot -i
# → @e5: Title field, @e6: Save button
agent-browser fill @e5 "Test Item"
agent-browser click @e6
agent-browser wait --network-idle

# 5. 最終確認
agent-browser snapshot -i
# → アイテムが作成されたことを確認
agent-browser screenshot e2e-complete.png

# 6. ブラウザを閉じる
agent-browser close
```

## ベストプラクティス

1. **データ独立性**: テストデータは各シナリオで独立して管理
2. **冪等性**: 同じテストを何度実行しても同じ結果
3. **原子性**: 1シナリオ失敗が他に影響しない
4. **可観測性**: 各ステップでログとスクリーンショット
5. **リアリスティック**: 実際のユーザー行動を模倣
6. **クリーンアップ**: テスト後はデータをリセット

## セッション管理の活用

認証状態を維持したテストには `--session` フラグを活用:

```bash
# ログイン状態を維持するセッション
agent-browser --session e2e-auth open "http://localhost:3000/login"
agent-browser --session e2e-auth snapshot -i
agent-browser --session e2e-auth fill @e1 "test@example.com"
agent-browser --session e2e-auth fill @e2 "password"
agent-browser --session e2e-auth click @e3
agent-browser --session e2e-auth wait --network-idle

# 同じセッションで他のテストを実行
agent-browser --session e2e-auth open "http://localhost:3000/dashboard"
agent-browser --session e2e-auth snapshot -i
# → ログイン状態が維持されていることを確認

# セッション状態を保存（再利用可能）
agent-browser state save e2e-auth-state.json

# 別のテストでセッション状態を復元
agent-browser state load e2e-auth-state.json
agent-browser open "http://localhost:3000/profile"
# → ログイン状態で開始
```

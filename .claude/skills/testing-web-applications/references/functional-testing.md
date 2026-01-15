# Functional Testing Guide

機能テストは、Webアプリの各機能が仕様通りに動作することを検証する。

## 目次

1. [正常系テストパターン](#正常系テストパターン)
2. [異常系テストパターン](#異常系テストパターン)
3. [入力バリデーション](#入力バリデーション)
4. [共通テストケース](#共通テストケース)

## 正常系テストパターン

### 認証機能

```yaml
TC-AUTH-001:
  name: 有効な認証情報でログイン
  category: positive
  commands:
    - agent-browser open "http://localhost:3000/login"
    - agent-browser snapshot -i
      # → @e1: Email textbox, @e2: Password textbox, @e3: Login button
    - agent-browser fill @e1 "valid@example.com"
    - agent-browser fill @e2 "ValidPass123!"
    - agent-browser click @e3
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → ダッシュボードが表示されることを確認
  expected: ホーム/ダッシュボード画面に遷移、ユーザー情報が表示される

TC-AUTH-002:
  name: ログアウト
  category: positive
  preconditions: ログイン済み
  commands:
    - agent-browser snapshot -i
      # → @e1: User menu
    - agent-browser click @e1
    - agent-browser snapshot -i
      # → @e2: Logout button
    - agent-browser click @e2
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → ログイン画面に戻ることを確認
  expected: ログイン画面に遷移、セッションがクリアされる

TC-AUTH-003:
  name: パスワードリセットリクエスト
  category: positive
  commands:
    - agent-browser open "http://localhost:3000/forgot-password"
    - agent-browser snapshot -i
      # → @e1: Email textbox, @e2: Send reset link button
    - agent-browser fill @e1 "registered@example.com"
    - agent-browser click @e2
    - agent-browser wait --text "メールを送信しました"
  expected: 成功メッセージ表示「メールを送信しました」
```

### CRUD操作

```yaml
TC-CRUD-001:
  name: 新規作成（Create）
  category: positive
  commands:
    - agent-browser snapshot -i
      # → @e1: Add button
    - agent-browser click @e1
    - agent-browser wait 1s
    - agent-browser snapshot -i
      # → @e2: Title textbox, @e3: Description textbox, @e4: Save button
    - agent-browser fill @e2 "テストアイテム"
    - agent-browser fill @e3 "詳細説明"
    - agent-browser click @e4
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 一覧に新規アイテムが表示されることを確認
  expected: 一覧に新規アイテムが表示、成功メッセージ

TC-CRUD-002:
  name: 詳細表示（Read）
  category: positive
  preconditions: アイテムが存在
  commands:
    - agent-browser snapshot -i
      # → @e1: Item link
    - agent-browser click @e1
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 詳細画面が表示されることを確認
  expected: アイテムの全情報が表示される

TC-CRUD-003:
  name: 編集（Update）
  category: positive
  preconditions: アイテムが存在
  commands:
    - agent-browser snapshot -i
      # → @e1: Edit button
    - agent-browser click @e1
    - agent-browser wait 1s
    - agent-browser snapshot -i
      # → @e2: Title textbox, @e3: Save button
    - agent-browser fill @e2 "更新されたタイトル"
    - agent-browser click @e3
    - agent-browser wait --network-idle
  expected: 変更内容が反映、成功メッセージ

TC-CRUD-004:
  name: 削除（Delete）
  category: positive
  preconditions: アイテムが存在
  commands:
    - agent-browser snapshot -i
      # → @e1: Delete button
    - agent-browser click @e1
    - agent-browser wait 0.5s
    - agent-browser snapshot -i
      # → @e2: Confirm delete button (確認ダイアログ)
    - agent-browser click @e2
    - agent-browser wait --network-idle
  expected: 一覧からアイテムが消える、成功メッセージ
```

### ナビゲーション

```yaml
TC-NAV-001:
  name: メインナビゲーション
  category: positive
  commands:
    - agent-browser snapshot -i
      # → @e1: Home link, @e2: Settings link
    - agent-browser click @e1
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → ホーム画面を確認
    - agent-browser click @e2
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 設定画面を確認
  expected: 各リンクで対応する画面に遷移

TC-NAV-002:
  name: ブラウザバック/フォワード
  category: positive
  commands:
    - agent-browser open "http://localhost:3000/page1"
    - agent-browser wait --network-idle
    - agent-browser open "http://localhost:3000/page2"
    - agent-browser wait --network-idle
    - agent-browser back
    - agent-browser wait --network-idle
    - agent-browser get url
      # → /page1 であることを確認
    - agent-browser forward
    - agent-browser wait --network-idle
    - agent-browser get url
      # → /page2 であることを確認
  expected: ブラウザ履歴が正しく機能

TC-NAV-003:
  name: パンくずナビゲーション
  category: positive
  commands:
    - agent-browser open "http://localhost:3000/category/item/detail"
    - agent-browser snapshot -i
      # → @e1: Category breadcrumb
    - agent-browser click @e1
    - agent-browser wait --network-idle
    - agent-browser get url
      # → /category であることを確認
  expected: カテゴリ一覧に遷移
```

### フォーム送信

```yaml
TC-FORM-001:
  name: 問い合わせフォーム送信
  category: positive
  commands:
    - agent-browser open "http://localhost:3000/contact"
    - agent-browser snapshot -i
      # → @e1: Name, @e2: Email, @e3: Message, @e4: Submit
    - agent-browser fill @e1 "テスト太郎"
    - agent-browser fill @e2 "test@example.com"
    - agent-browser fill @e3 "お問い合わせ内容"
    - agent-browser click @e4
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 送信完了メッセージを確認
  expected: 送信完了メッセージ、フォームがリセット
```

## 異常系テストパターン

### 認証エラー

```yaml
TC-AUTH-ERR-001:
  name: 無効なパスワードでログイン
  category: negative
  commands:
    - agent-browser open "http://localhost:3000/login"
    - agent-browser snapshot -i
      # → @e1: Email, @e2: Password, @e3: Login button
    - agent-browser fill @e1 "valid@example.com"
    - agent-browser fill @e2 "WrongPassword"
    - agent-browser click @e3
    - agent-browser wait 2s
    - agent-browser snapshot -i
      # → エラーメッセージを確認
  expected: エラーメッセージ「パスワードが正しくありません」、ログインできない

TC-AUTH-ERR-002:
  name: 未登録メールでログイン
  category: negative
  commands:
    - agent-browser open "http://localhost:3000/login"
    - agent-browser snapshot -i
    - agent-browser fill @e1 "notregistered@example.com"
    - agent-browser fill @e2 "AnyPassword123"
    - agent-browser click @e3
    - agent-browser wait 2s
    - agent-browser snapshot -i
  expected: エラーメッセージ「アカウントが見つかりません」

TC-AUTH-ERR-003:
  name: 認証なしで保護ページにアクセス
  category: negative
  preconditions: ログアウト状態
  commands:
    - agent-browser open "http://localhost:3000/dashboard"
    - agent-browser wait --network-idle
    - agent-browser get url
      # → /login にリダイレクトされることを確認
  expected: ログインページにリダイレクト

TC-AUTH-ERR-004:
  name: セッション切れ後の操作
  category: negative
  preconditions: セッション有効期限切れ
  commands:
    - agent-browser snapshot -i
      # → @e1: Save button
    - agent-browser click @e1
    - agent-browser wait 2s
    - agent-browser snapshot -i
      # → 再ログインを促すメッセージ/モーダルを確認
  expected: 再ログインを促すメッセージ/モーダル
```

### 入力エラー

```yaml
TC-INPUT-ERR-001:
  name: 必須項目未入力
  category: negative
  commands:
    - agent-browser open "http://localhost:3000/form"
    - agent-browser snapshot -i
      # → @e1: Submit button
    - agent-browser click @e1
    - agent-browser wait 1s
    - agent-browser snapshot -i
      # → バリデーションエラーを確認
  expected: 各必須項目にバリデーションエラー表示

TC-INPUT-ERR-002:
  name: メール形式不正
  category: negative
  commands:
    - agent-browser open "http://localhost:3000/form"
    - agent-browser snapshot -i
      # → @e1: Email textbox, @e2: Submit button
    - agent-browser fill @e1 "invalid-email"
    - agent-browser click @e2
    - agent-browser wait 1s
    - agent-browser snapshot -i
  expected: 「有効なメールアドレスを入力してください」

TC-INPUT-ERR-003:
  name: 文字数超過
  category: negative
  commands:
    - agent-browser open "http://localhost:3000/form"
    - agent-browser snapshot -i
      # → @e1: Title textbox (255文字制限)
    - agent-browser fill @e1 "あああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ"
    - agent-browser snapshot -i
  expected: 入力制限または警告表示
```

### サーバーエラー

```yaml
TC-SERVER-ERR-001:
  name: 404ページ
  category: negative
  commands:
    - agent-browser open "http://localhost:3000/nonexistent-page"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → カスタム404ページを確認
  expected: カスタム404ページ表示、ホームへのリンク

TC-SERVER-ERR-002:
  name: サーバーエラー表示
  category: negative
  commands:
    # サーバーが500エラーを返す条件をトリガー
    - agent-browser open "http://localhost:3000/trigger-error"
    - agent-browser wait 2s
    - agent-browser snapshot -i
  expected: ユーザーフレンドリーなエラーメッセージ、リトライ案内
```

## 入力バリデーション

### 境界値分析

| フィールド | 最小 | 最小-1 | 最大 | 最大+1 |
|-----------|------|--------|------|--------|
| パスワード | 8文字(OK) | 7文字(NG) | 32文字(OK) | 33文字(NG) |
| ユーザー名 | 1文字(OK) | 0文字(NG) | 50文字(OK) | 51文字(NG) |
| 数量 | 1(OK) | 0(NG) | 999(OK) | 1000(NG) |
| 価格 | 0(OK) | -1(NG) | 9999999(OK) | 10000000(NG) |

### 特殊文字・セキュリティテスト

```yaml
TC-SEC-001:
  name: XSS攻撃入力テスト
  category: negative
  test_inputs:
    - "<script>alert('XSS')</script>"
    - "<img src=x onerror=alert('XSS')>"
    - "javascript:alert('XSS')"
  commands:
    - agent-browser open "http://localhost:3000/form"
    - agent-browser snapshot -i
      # → @e1: Input textbox, @e2: Submit button
    - agent-browser fill @e1 "<script>alert('XSS')</script>"
    - agent-browser click @e2
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → スクリプトが実行されず、エスケープされて表示されることを確認
  expected: 入力がエスケープされる、スクリプト実行なし

TC-SEC-002:
  name: SQLインジェクション入力テスト
  category: negative
  test_inputs:
    - "' OR '1'='1"
    - "'; DROP TABLE users;--"
    - "1; SELECT * FROM users"
  commands:
    - agent-browser open "http://localhost:3000/search"
    - agent-browser snapshot -i
      # → @e1: Search textbox, @e2: Search button
    - agent-browser fill @e1 "' OR '1'='1"
    - agent-browser click @e2
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
  expected: 正常なエラー処理、DBへの不正アクセスなし

TC-SEC-003:
  name: 特殊文字入力テスト
  category: positive
  test_inputs:
    - "日本語テスト"
    - "Ñoño"
    - "Test\nNew Line"
    - "Tab\tCharacter"
  commands:
    - agent-browser open "http://localhost:3000/form"
    - agent-browser snapshot -i
      # → @e1: Text textbox, @e2: Save button
    - agent-browser fill @e1 "日本語テスト"
    - agent-browser click @e2
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
  expected: 特殊文字が正しく保存・表示される
```

## 共通テストケース

### フォーム操作

```yaml
TC-FORM-COMMON-001:
  name: フォームリセット
  category: positive
  commands:
    - agent-browser open "http://localhost:3000/form"
    - agent-browser snapshot -i
      # → @e1: Input fields, @e2: Reset button
    - agent-browser fill @e1 "入力値"
    - agent-browser click @e2
    - agent-browser snapshot -i
      # → フィールドがクリアされていることを確認
  expected: 全フィールドがクリアされる

TC-FORM-COMMON-002:
  name: 確認ダイアログキャンセル
  category: positive
  commands:
    - agent-browser snapshot -i
      # → @e1: Delete button
    - agent-browser click @e1
    - agent-browser wait 0.5s
    - agent-browser snapshot -i
      # → @e2: Cancel button (確認ダイアログ)
    - agent-browser click @e2
    - agent-browser snapshot -i
      # → 元の画面に戻ることを確認
  expected: 削除されない、元の画面に戻る

TC-FORM-COMMON-003:
  name: 未保存離脱警告
  category: positive
  commands:
    - agent-browser open "http://localhost:3000/edit"
    - agent-browser snapshot -i
      # → @e1: Input textbox
    - agent-browser fill @e1 "未保存の変更"
    - agent-browser open "http://localhost:3000/other-page"
    # ブラウザの離脱警告ダイアログが表示される
  expected: 「変更が保存されていません」警告ダイアログ
```

### ページング・ソート

```yaml
TC-LIST-001:
  name: ページネーション
  category: positive
  preconditions: 20件以上のデータ
  commands:
    - agent-browser open "http://localhost:3000/items"
    - agent-browser snapshot -i
      # → @e1: Page 2 button, @e2: Next page button
    - agent-browser click @e1
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 2ページ目のデータを確認
    - agent-browser click @e2
    - agent-browser wait --network-idle
  expected: 正しいページのデータが表示

TC-LIST-002:
  name: ソート機能
  category: positive
  commands:
    - agent-browser open "http://localhost:3000/items"
    - agent-browser snapshot -i
      # → @e1: Sort by date header
    - agent-browser click @e1
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 日付降順でソートされていることを確認
    - agent-browser click @e1
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 日付昇順でソートされていることを確認
  expected: ソート順が切り替わる
```

## 実行例

```bash
# 1. ページにアクセス
agent-browser open "http://localhost:3000/login"

# 2. ページ構造を確認（要素参照を取得）
agent-browser snapshot -i
# 出力例:
# @e1: textbox "Email"
# @e2: textbox "Password"
# @e3: button "Login"

# 3. 入力
agent-browser fill @e1 "test@example.com"
agent-browser fill @e2 "password123"

# 4. 送信
agent-browser click @e3

# 5. 結果確認
agent-browser wait --network-idle
agent-browser snapshot -i
# → 期待する要素が存在するか確認

# 6. スクリーンショット保存
agent-browser screenshot login-result.png
```

# UI Testing Guide

UIテストは、Webアプリの視覚的要素とユーザーインターフェースの品質を検証する。

## 目次

1. [レイアウト検証](#レイアウト検証)
2. [レスポンシブテスト](#レスポンシブテスト)
3. [アクセシビリティテスト](#アクセシビリティテスト)
4. [インタラクションテスト](#インタラクションテスト)

## レイアウト検証

### 要素表示テスト

```yaml
TC-UI-LAYOUT-001:
  name: 主要要素の表示確認
  category: ui
  commands:
    - agent-browser open "http://localhost:3000"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # 以下の要素が存在することを確認:
      # - ヘッダー
      # - ナビゲーションメニュー
      # - メインコンテンツエリア
      # - フッター
    - agent-browser screenshot layout-main.png
  expected: すべての主要UI要素が正しく表示

TC-UI-LAYOUT-002:
  name: 空状態の表示
  category: ui
  preconditions: データなし
  commands:
    - agent-browser open "http://localhost:3000/items"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → 空状態メッセージまたはイラストが表示されることを確認
    - agent-browser screenshot empty-state.png
  expected: 適切な空状態UIが表示される

TC-UI-LAYOUT-003:
  name: ローディング状態
  category: ui
  commands:
    - agent-browser open "http://localhost:3000/items"
    - agent-browser snapshot -i
      # → @e1: Load data button
    - agent-browser click @e1
    - agent-browser snapshot -i
      # → ローディングスピナーまたはスケルトン表示を確認
    - agent-browser screenshot loading-state.png
  expected: ローディング中の視覚的フィードバック
```

### 要素配置テスト

```yaml
TC-UI-ALIGN-001:
  name: フォーム要素の配置
  category: ui
  commands:
    - agent-browser open "http://localhost:3000/form"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # 確認事項:
      # - ラベルと入力欄が揃っている
      # - ボタンが適切な位置にある
      # - 必須マークが表示されている
    - agent-browser screenshot form-layout.png
  expected: フォーム要素が整列している

TC-UI-ALIGN-002:
  name: カード/リストの配置
  category: ui
  commands:
    - agent-browser open "http://localhost:3000/items"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # 確認事項:
      # - カードが均等に配置
      # - 間隔が一定
      # - グリッドが崩れていない
    - agent-browser screenshot grid-layout.png
  expected: 一貫したカード配置
```

## レスポンシブテスト

### ビューポートサイズ

```yaml
viewports:
  mobile_small:
    width: 320
    height: 568
    name: "iPhone SE"

  mobile_medium:
    width: 375
    height: 667
    name: "iPhone 8"

  mobile_large:
    width: 414
    height: 896
    name: "iPhone 11 Pro Max"

  tablet:
    width: 768
    height: 1024
    name: "iPad"

  desktop:
    width: 1280
    height: 800
    name: "Desktop"

  desktop_large:
    width: 1920
    height: 1080
    name: "Full HD"
```

### レスポンシブテストケース

```yaml
TC-UI-RESPONSIVE-001:
  name: モバイルレイアウト
  category: ui
  viewport: mobile_medium
  commands:
    - agent-browser open --viewport 375x667 "http://localhost:3000"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # 確認事項:
      # - ハンバーガーメニューが表示
      # - 横スクロールなし
      # - タップターゲットが十分なサイズ
    - agent-browser screenshot responsive-mobile.png
  expected: モバイル最適化されたレイアウト

TC-UI-RESPONSIVE-002:
  name: タブレットレイアウト
  category: ui
  viewport: tablet
  commands:
    - agent-browser open --viewport 768x1024 "http://localhost:3000"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # 確認事項:
      # - 2カラムレイアウト
      # - ナビゲーションが適切に表示
    - agent-browser screenshot responsive-tablet.png
  expected: タブレット最適化されたレイアウト

TC-UI-RESPONSIVE-003:
  name: デスクトップレイアウト
  category: ui
  viewport: desktop
  commands:
    - agent-browser open --viewport 1280x800 "http://localhost:3000"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # 確認事項:
      # - フルナビゲーション表示
      # - サイドバー表示
      # - コンテンツ幅が適切
    - agent-browser screenshot responsive-desktop.png
  expected: デスクトップ最適化されたレイアウト
```

### ブレークポイントテスト

```yaml
TC-UI-BREAKPOINT-001:
  name: ナビゲーション切り替え
  category: ui
  commands:
    # デスクトップ幅
    - agent-browser open --viewport 769x800 "http://localhost:3000"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → フルナビゲーション表示を確認
    - agent-browser screenshot nav-desktop.png

    # ブレークポイント以下
    - agent-browser close
    - agent-browser open --viewport 768x800 "http://localhost:3000"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → ハンバーガーメニューに切り替わることを確認
    - agent-browser screenshot nav-mobile.png
  expected: ブレークポイントでナビゲーションが切り替わる
```

## アクセシビリティテスト

### キーボードナビゲーション

```yaml
TC-A11Y-001:
  name: キーボードのみでの操作
  category: accessibility
  commands:
    - agent-browser open "http://localhost:3000"
    - agent-browser wait --network-idle
    - agent-browser press Tab
    - agent-browser snapshot -i
      # → 最初のインタラクティブ要素にフォーカスがあることを確認
    - agent-browser press Tab
    - agent-browser press Tab
    - agent-browser press Tab
    - agent-browser press Tab
    - agent-browser press Tab
    - agent-browser snapshot -i
      # → フォーカスが順番に移動していることを確認
    - agent-browser press Enter
    - agent-browser snapshot -i
      # → フォーカス中の要素がアクティブ化されることを確認
  expected: すべての機能がキーボードで操作可能

TC-A11Y-002:
  name: フォーカスインジケーター
  category: accessibility
  commands:
    - agent-browser open "http://localhost:3000"
    - agent-browser wait --network-idle
    - agent-browser press Tab
    - agent-browser snapshot -i
      # → フォーカスリングが視認できることを確認
    - agent-browser screenshot focus-indicator.png
  expected: フォーカス状態が視覚的に明確
```

### アクセシビリティツリー検証

```yaml
TC-A11Y-003:
  name: アクセシビリティツリー構造
  category: accessibility
  commands:
    - agent-browser open "http://localhost:3000"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # 確認事項:
      # - すべての画像にalt属性
      # - 見出しが適切な階層（h1→h2→h3）
      # - フォーム要素にラベル関連付け
      # - ランドマーク（header, main, footer）が存在
  expected: スクリーンリーダーで理解可能な構造

TC-A11Y-004:
  name: ボタン・リンクのアクセシブル名
  category: accessibility
  commands:
    - agent-browser open "http://localhost:3000"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # 確認事項:
      # - すべてのボタンにアクセシブル名
      # - アイコンのみのボタンにaria-label
      # - リンクテキストが目的を説明
  expected: すべてのインタラクティブ要素が識別可能
```

### カラーコントラスト

```yaml
TC-A11Y-005:
  name: テキストのコントラスト比
  category: accessibility
  commands:
    - agent-browser open "http://localhost:3000"
    - agent-browser wait --network-idle
    - agent-browser screenshot contrast-check.png
    # 手動確認:
    # - body text: 4.5:1以上
    # - large text: 3:1以上
    # - ui components: 3:1以上
  expected: WCAG AAレベルのコントラスト比を満たす
```

## インタラクションテスト

### ホバー・フォーカス状態

```yaml
TC-UI-HOVER-001:
  name: ボタンホバー状態
  category: ui
  commands:
    - agent-browser open "http://localhost:3000"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → @e1: Primary button
    - agent-browser hover @e1
    - agent-browser snapshot -i
      # → ホバースタイルが適用されることを確認
    - agent-browser screenshot button-hover.png
  expected: ホバー時に視覚的変化

TC-UI-HOVER-002:
  name: リンクホバー状態
  category: ui
  commands:
    - agent-browser open "http://localhost:3000"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → @e1: Navigation link
    - agent-browser hover @e1
    - agent-browser snapshot -i
      # → ホバースタイル（下線/色変化）を確認
  expected: リンクのホバー状態が明確
```

### アニメーション・トランジション

```yaml
TC-UI-ANIM-001:
  name: モーダル開閉アニメーション
  category: ui
  commands:
    - agent-browser open "http://localhost:3000"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → @e1: Open modal button
    - agent-browser click @e1
    - agent-browser wait 0.5s
    - agent-browser snapshot -i
      # → モーダルがフェードインしていることを確認
      # → @e2: Close modal button
    - agent-browser screenshot modal-open.png
    - agent-browser click @e2
    - agent-browser wait 0.5s
    - agent-browser snapshot -i
      # → モーダルがフェードアウトしていることを確認
    - agent-browser screenshot modal-close.png
  expected: スムーズなアニメーション遷移

TC-UI-ANIM-002:
  name: ローディングアニメーション
  category: ui
  commands:
    - agent-browser open "http://localhost:3000/form"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → @e1: Submit button
    - agent-browser click @e1
    - agent-browser snapshot -i
      # → ローディングスピナーがアニメーションしていることを確認
  expected: ローディング中の視覚的フィードバック
```

### フォーム状態

```yaml
TC-UI-FORM-STATE-001:
  name: 入力フィールドの状態変化
  category: ui
  commands:
    - agent-browser open "http://localhost:3000/form"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → @e1: Text input, @e2: Outside area
    - agent-browser click @e1
    - agent-browser snapshot -i
      # → フォーカス状態のスタイルを確認
    - agent-browser fill @e1 "入力テキスト"
    - agent-browser snapshot -i
      # → 入力済み状態を確認
    - agent-browser click @e2
    - agent-browser snapshot -i
      # → ブラー状態を確認
  expected: 各状態で適切なスタイル

TC-UI-FORM-STATE-002:
  name: エラー状態の表示
  category: ui
  commands:
    - agent-browser open "http://localhost:3000/form"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → @e1: Email input, @e2: Submit button
    - agent-browser fill @e1 "invalid"
    - agent-browser click @e2
    - agent-browser wait 1s
    - agent-browser snapshot -i
      # 確認事項:
      # - 赤い枠線/背景
      # - エラーメッセージ表示
      # - エラーアイコン
    - agent-browser screenshot error-state.png
  expected: エラー状態が視覚的に明確

TC-UI-FORM-STATE-003:
  name: 成功状態の表示
  category: ui
  commands:
    - agent-browser open "http://localhost:3000/form"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # → @e1: Email input
    - agent-browser fill @e1 "valid@example.com"
    - agent-browser snapshot -i
      # → 緑のチェックマーク/成功スタイルを確認
  expected: 成功状態が視覚的に明確

TC-UI-FORM-STATE-004:
  name: 無効状態（Disabled）
  category: ui
  commands:
    - agent-browser open "http://localhost:3000/form"
    - agent-browser wait --network-idle
    - agent-browser snapshot -i
      # 確認事項:
      # - 無効なボタンはグレーアウト
      # - 無効な入力欄は操作不可
      # - カーソルがnot-allowed
  expected: 無効状態が明確に区別される
```

## 実行例

```bash
# 1. ビューポート設定（レスポンシブテスト）
agent-browser open --viewport 375x667 "http://localhost:3000"

# 2. ページアクセス（デフォルトビューポート）
agent-browser open "http://localhost:3000"

# 3. アクセシビリティツリー取得
agent-browser snapshot -i
# → 要素構造、アクセシブル名、役割を確認

# 4. ホバーテスト
agent-browser hover @e1
agent-browser screenshot hover-state.png

# 5. キーボードナビゲーション
agent-browser press Tab
agent-browser snapshot -i
# → フォーカス位置を確認
agent-browser screenshot focus-state.png

# 6. 複数ビューポートでスクリーンショット
# モバイル
agent-browser open --viewport 375x667 "http://localhost:3000"
agent-browser screenshot ui-mobile.png

# タブレット
agent-browser close
agent-browser open --viewport 768x1024 "http://localhost:3000"
agent-browser screenshot ui-tablet.png

# デスクトップ
agent-browser close
agent-browser open --viewport 1280x800 "http://localhost:3000"
agent-browser screenshot ui-desktop.png
```

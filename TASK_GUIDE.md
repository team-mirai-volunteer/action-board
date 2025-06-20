# アクションボード - 環境構築後のタスク進め方ガイド

このガイドは、アクションボードプロジェクトの環境構築が完了した開発者向けに、実際の開発タスクの進め方を説明します。

## 📋 前提条件

以下の環境構築が完了していることを確認してください：

- Node.js、Docker、Supabase CLIのインストール
- リポジトリのクローン
- 環境変数の設定（`.env.local`）
- ローカルSupabase環境の起動（`supabase start`）
- 依存関係のインストール（`npm install`）

詳細な環境構築手順は[README.md](./README.md)を参照してください。

## 🚀 開発開始前のチェックリスト

### 1. 環境の確認
```bash
# Supabaseが起動していることを確認
supabase status

# 開発サーバーが正常に起動することを確認
npm run dev
```

### 2. 最新コードの取得
```bash
# developブランチに移動
git checkout develop

# 最新のコードを取得
git pull origin develop
```

### 3. データベースの状態確認
```bash
# 最新のマイグレーションが適用されていることを確認
supabase migration list

# 必要に応じてデータベースをリセット
supabase db reset
```

## 🔄 開発ワークフロー

### ブランチ戦略
- `main`: 本番環境用（直接コミット禁止）
- `develop`: 開発統合ブランチ（PRのデフォルトターゲット）
- `feat/xxx`: 機能開発ブランチ

### 新機能開発の流れ

#### 1. 機能ブランチの作成
```bash
# developブランチから新しい機能ブランチを作成
git checkout develop
git pull origin develop
git checkout -b feat/your-feature-name
```

#### 2. 開発環境の起動
```bash
# ターミナル1: Supabase環境
supabase start

# ターミナル2: 開発サーバー
npm run dev

# ターミナル3: Storybook（UIコンポーネント開発時）
npm run storybook
```

#### 3. 開発中の品質チェック
```bash
# コードフォーマット・リンティング（自動修正付き）
npm run biome:check:write

# 型チェック
npm run build

# テスト実行
npm run test
```

#### 4. データベース変更がある場合
```bash
# マイグレーションファイルの作成
supabase migration new add_your_feature

# マイグレーション適用
supabase migration up

# TypeScript型定義の再生成
npm run types
```

#### 5. コミット・プッシュ
```bash
# 変更ファイルを確認
git status

# 必要なファイルのみをステージング（git add . は使用禁止）
git add path/to/changed/file1 path/to/changed/file2

# コミット
git commit -m "feat: 機能の説明"

# プッシュ
git push origin feat/your-feature-name
```

#### 6. プルリクエストの作成
- GitHubでPRを作成
- ベースブランチ: `develop`
- レビュアーを指定
- 適切なラベルを付与

## 🧪 テスト戦略

### テストの種類と実行方法

#### 1. ユニットテスト
```bash
# 全ユニットテストを実行
npm run test

# 特定のテストファイルを実行
npm test -- --testPathPattern=validation
```

#### 2. RLS（行レベルセキュリティ）テスト
```bash
# 全RLSテストを実行
npm run test:rls

# 特定のテーブルのRLSテストを実行
npm run test:rls -- tests/rls/missions.test.ts
```

#### 3. E2Eテスト
```bash
# 全E2Eテストを実行
npm run test:e2e

# UIモードでデバッグ実行
npm run test:e2e:ui

# 特定のブラウザでテスト
npm run test:e2e -- --project=chromium
```

#### 4. テスト結果の確認
```bash
# Playwrightレポートの表示
npx playwright show-report
```

### 新機能開発時のテスト追加ガイドライン

1. **新しいUIコンポーネント**: Storybookストーリーを作成
2. **新しいデータベーステーブル**: RLSポリシーテストを追加
3. **新しいページ・機能**: E2Eテストを追加
4. **バリデーションロジック**: ユニットテストを追加

## 🎯 タスクタイプ別の進め方

### フロントエンド機能開発

#### 1. UIコンポーネントの開発
```bash
# Storybookを起動してコンポーネントを開発
npm run storybook

# コンポーネントファイルの作成場所
# - 汎用コンポーネント: components/ui/
# - 機能固有コンポーネント: components/mission/, components/ranking/ など
```

#### 2. ページの開発
```bash
# Next.js App Routerの構造に従ってファイルを配置
# - 認証ページ: app/(auth-pages)/
# - 保護されたページ: app/(protected)/
# - 公開ページ: app/
```

#### 3. スタイリング
- Tailwind CSSを使用
- Radix UIコンポーネントをベースに構築
- 既存のデザインシステムに従う

### バックエンド機能開発

#### 1. データベーススキーマの変更
```bash
# 1. マイグレーションファイルを作成
supabase migration new your_migration_name

# 2. SQLファイルを編集
# supabase/migrations/[timestamp]_your_migration_name.sql

# 3. マイグレーションを適用
supabase migration up

# 4. 型定義を再生成
npm run types

# 5. RLSポリシーを設定（必要に応じて）
# 6. RLSテストを追加
```

#### 2. Server Actionsの開発
```bash
# Server Actionsの配置場所
# - 認証関連: app/actions.ts
# - ページ固有: app/[page]/actions.ts
```

#### 3. APIルートの開発
```bash
# APIルートの配置場所: app/api/
# 例: app/api/missions/route.ts
```

### データベース関連タスク

#### 1. 新しいテーブルの追加
1. マイグレーションファイルでテーブル作成
2. RLSポリシーの設定
3. TypeScript型定義の生成
4. RLSテストの追加
5. 必要に応じてシードデータの追加

#### 2. 既存テーブルの変更
1. マイグレーションファイルで変更を定義
2. 型定義の再生成
3. 影響を受けるコードの修正
4. テストの更新

## 🔧 よく使用するコマンド一覧

### 開発環境
```bash
# 開発サーバー起動
npm run dev

# Storybook起動
npm run storybook

# Supabase環境管理
supabase start
supabase stop
supabase status
```

### コード品質
```bash
# フォーマット・リンティング（自動修正）
npm run biome:check:write

# ビルドチェック
npm run build
```

### テスト
```bash
# 全テスト実行
npm run test

# RLSテスト
npm run test:rls

# E2Eテスト
npm run test:e2e

# E2Eテスト（UIモード）
npm run test:e2e:ui
```

### データベース
```bash
# マイグレーション作成
supabase migration new migration_name

# マイグレーション適用
supabase migration up

# データベースリセット
supabase db reset

# 型定義生成
npm run types
```

## 🚨 トラブルシューティング

### よくある問題と解決方法

#### 1. 開発サーバーが起動しない
```bash
# Node.jsのバージョン確認
node --version

# 依存関係の再インストール
rm -rf node_modules package-lock.json
npm install
```

#### 2. Supabaseに接続できない
```bash
# Supabaseの状態確認
supabase status

# 環境変数の確認
cat .env.local

# Supabaseの再起動
supabase stop
supabase start
```

#### 3. 型エラーが発生する
```bash
# 型定義の再生成
npm run types

# TypeScriptキャッシュのクリア
npx tsc --build --clean
```

#### 4. テストが失敗する
```bash
# データベースのリセット
supabase db reset

# テストデータの確認
# tests/e2e-test-helpers.ts を確認
```

## 📚 参考資料

### プロジェクト固有ドキュメント
- [README.md](./README.md) - 環境構築とプロジェクト概要
- [CLAUDE.md](./CLAUDE.md) - 開発コマンドとアーキテクチャ詳細
- [CLA.md](./CLA.md) - コントリビューターライセンス契約

### 技術スタック
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Playwright Testing](https://playwright.dev/)

### コード品質ツール
- [Biome](https://biomejs.dev/) - フォーマッター・リンター
- [Lefthook](https://github.com/evilmartians/lefthook) - Git hooks

## 💡 開発のベストプラクティス

### 1. コード品質
- コミット前に必ず `npm run biome:check:write` を実行
- 型安全性を重視し、`any` の使用を避ける
- 既存のコードスタイルに合わせる

### 2. テスト
- 新機能には必ずテストを追加
- RLSポリシーの変更時は対応するテストを更新
- E2Eテストは重要なユーザーフローをカバー

### 3. データベース
- マイグレーションファイルは必ずレビューを受ける
- RLSポリシーは最小権限の原則に従う
- 本番データに影響する変更は慎重に行う

### 4. コミット・PR
- コミットメッセージは明確で具体的に
- PRには適切な説明とスクリーンショットを添付
- レビューコメントには迅速に対応

## 🎉 開発完了後のチェックリスト

- [ ] 全テストが通過している
- [ ] コードフォーマットが適用されている
- [ ] 型エラーがない
- [ ] 新機能にテストが追加されている
- [ ] ドキュメントが更新されている（必要に応じて）
- [ ] PRが作成され、レビューが完了している
- [ ] CIが通過している

---

このガイドを参考に、効率的で品質の高い開発を進めてください。質問や不明点があれば、チームメンバーに相談することをお勧めします。

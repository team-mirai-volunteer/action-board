# Deployment Guide: Cloudflare Pages + Supabase

このガイドでは、Action BoardをCloudflare PagesとSupabaseにデプロイする手順を説明します。

## 🏗️ アーキテクチャ概要

- **フロントエンド**: Cloudflare Pages (Next.js Static Export)
- **バックエンド**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **CI/CD**: GitHub Actions
- **DNS**: Cloudflare DNS

## 📋 前提条件

### 必要なアカウント
1. [Cloudflare](https://cloudflare.com) アカウント
2. [Supabase](https://supabase.com) アカウント  
3. GitHub アカウント（リポジトリアクセス権限）

### 必要なツール
- Node.js 22+
- npm
- Supabase CLI
- Git

## 🚀 デプロイメント手順

### Step 1: Supabase プロジェクトの作成

1. **新しいプロジェクトを作成**
   ```bash
   # Supabase ダッシュボードで新しいプロジェクトを作成
   # または CLI を使用:
   npx supabase projects create action-board-production --org-id your-org-id
   ```

2. **プロジェクト情報を取得**
   - Project Reference ID
   - API URL
   - Anon Key
   - Service Role Key

3. **データベースをセットアップ**
   ```bash
   # ローカルからマイグレーションを実行
   ./scripts/deploy-supabase.sh production
   ```

### Step 2: Cloudflare Pages の設定

1. **Cloudflare Pages プロジェクトを作成**
   - Cloudflare ダッシュボード → Pages → Create a project
   - GitHub リポジトリを接続

2. **ビルド設定を構成**
   ```
   Framework preset: None
   Build command: npm run build:cloudflare
   Build output directory: out
   Root directory: /
   ```

3. **環境変数を設定**
   `.env.cloudflare` ファイルの内容を参考に、以下の環境変数をCloudflare Pagesダッシュボードで設定:

   **必須環境変数:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_APP_ORIGIN=https://your-domain.pages.dev
   SITE_URL=https://your-domain.pages.dev
   ADDITIONAL_REDIRECT_URLS=https://your-domain.pages.dev
   CLOUDFLARE_BUILD=true
   ```

   **オプション環境変数:**
   ```
   NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   LINE_CLIENT_SECRET=your-line-secret
   NEXT_PUBLIC_LINE_CLIENT_ID=your-line-id
   MAILGUN_API_KEY=your-mailgun-key
   MAILGUN_DOMAIN=your-domain.com
   ```

### Step 3: GitHub Actions の設定

1. **リポジトリシークレットを設定**
   GitHub リポジトリ → Settings → Secrets and variables → Actions

   **必須シークレット:**
   ```
   CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
   CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
   SUPABASE_ACCESS_TOKEN=your-supabase-access-token
   SUPABASE_PROJECT_ID=your-project-reference-id
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   **追加シークレット:**
   ```
   PRODUCTION_APP_ORIGIN=https://your-production-domain.com
   STAGING_APP_ORIGIN=https://your-staging-domain.pages.dev
   NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
   SENTRY_AUTH_TOKEN=your-sentry-auth-token
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   NEXT_PUBLIC_LINE_CLIENT_ID=your-line-client-id
   ```

2. **GitHub Actions ワークフローが正常に動作することを確認**
   - `develop` ブランチにプッシュしてステージング環境をテスト
   - `main` ブランチにプッシュして本番環境をデプロイ

### Step 4: ドメイン設定（オプション）

1. **カスタムドメインをCloudflare Pagesに追加**
   - Pages プロジェクト → Custom domains → Set up a custom domain

2. **DNS レコードを設定**
   ```
   Type: CNAME
   Name: www (またはサブドメイン)
   Target: your-project.pages.dev
   ```

3. **SSL設定を確認**
   - Cloudflare が自動的にSSL証明書を発行

## 🔧 環境別設定

### 本番環境 (Production)
- **ブランチ**: `main`
- **Cloudflare Project**: `action-board-production`
- **Supabase Project**: 本番用プロジェクト
- **ドメイン**: カスタムドメイン

### ステージング環境 (Staging)  
- **ブランチ**: `develop`
- **Cloudflare Project**: `action-board-staging`
- **Supabase Project**: ステージング用プロジェクト
- **ドメイン**: `*.pages.dev`

## 🐛 トラブルシューティング

### よくある問題

1. **ビルドエラー: "Cannot resolve module"**
   ```bash
   # 依存関係を確認
   npm ci
   # TypeScript 型を再生成
   npm run types
   ```

2. **Supabase 接続エラー**
   ```bash
   # 環境変数を確認
   echo $NEXT_PUBLIC_SUPABASE_URL
   # プロジェクトの接続状態を確認
   npx supabase status
   ```

3. **認証エラー**
   - Supabase ダッシュボードで認証設定を確認
   - リダイレクトURLが正しく設定されているか確認

### デバッグ方法

1. **ローカルでCloudflareビルドをテスト**
   ```bash
   npm run build:cloudflare
   npx serve out
   ```

2. **Supabaseローカル環境でテスト**
   ```bash
   supabase start
   npm run dev
   ```

3. **GitHub Actionsログを確認**
   - リポジトリ → Actions → 失敗したワークフローを確認

## 📊 監視とメンテナンス

### 監視設定
- **Sentry**: エラー監視とパフォーマンストラッキング
- **Google Analytics**: ユーザー分析
- **Cloudflare Analytics**: トラフィック分析
- **Supabase Dashboard**: データベース監視

### 定期メンテナンス
1. **依存関係の更新**
   ```bash
   npm audit
   npm update
   ```

2. **データベースバックアップの確認**
   - Supabase ダッシュボードで自動バックアップ設定を確認

3. **SSL証明書の確認**
   - Cloudflare で証明書の自動更新設定を確認

## 🔐 セキュリティ設定

### Supabase セキュリティ
- RLS (Row Level Security) ポリシーの確認
- API キーのローテーション
- データベースアクセス権限の定期確認

### Cloudflare セキュリティ
- WAF ルールの設定
- DDoS 保護の有効化
- セキュリティヘッダーの設定

## 📚 参考リンク

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
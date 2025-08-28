# Cloudflare + Supabase Deployment Checklist

## 📋 事前準備

- [ ] Cloudflareアカウントの作成
- [ ] Supabaseアカウントの作成  
- [ ] ドメイン名の決定（オプション）

## 🗄️ Supabase設定

- [ ] 本番用Supabaseプロジェクトの作成
- [ ] ステージング用Supabaseプロジェクトの作成（オプション）
- [ ] プロジェクト情報の記録:
  - [ ] Project Reference ID
  - [ ] API URL
  - [ ] Anon Key
  - [ ] Service Role Key
- [ ] データベースマイグレーションの実行
- [ ] 認証設定の確認（リダイレクトURL等）

## ☁️ Cloudflare Pages設定

- [ ] Cloudflare Pages プロジェクトの作成（本番用）
- [ ] Cloudflare Pages プロジェクト作成（ステージング用）
- [ ] GitHub リポジトリとの連携
- [ ] ビルド設定の構成:
  - [ ] Build command: `npm run build:cloudflare`
  - [ ] Build output directory: `out`
- [ ] 環境変数の設定（`.env.cloudflare`を参照）

## 🔑 GitHub Secrets設定

**Cloudflare関連:**
- [ ] `CLOUDFLARE_API_TOKEN`
- [ ] `CLOUDFLARE_ACCOUNT_ID`

**Supabase関連:**
- [ ] `SUPABASE_ACCESS_TOKEN`
- [ ] `SUPABASE_PROJECT_ID` (本番用)
- [ ] `SUPABASE_STAGING_PROJECT_REF` (ステージング用)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `SUPABASE_DB_PASSWORD`

**アプリ設定:**
- [ ] `PRODUCTION_APP_ORIGIN`
- [ ] `STAGING_APP_ORIGIN`

**外部サービス（オプション）:**
- [ ] `NEXT_PUBLIC_SENTRY_DSN`
- [ ] `SENTRY_AUTH_TOKEN`
- [ ] `NEXT_PUBLIC_GA_ID`
- [ ] `NEXT_PUBLIC_LINE_CLIENT_ID`

## 🚀 デプロイメントテスト

- [ ] `develop`ブランチにテストコミットをプッシュ
- [ ] GitHub Actionsワークフローの成功確認
- [ ] ステージング環境での動作確認
- [ ] `main`ブランチへのマージとデプロイ確認
- [ ] 本番環境での動作確認

## 🌐 ドメイン設定（オプション）

- [ ] Cloudflare Pagesにカスタムドメインを追加
- [ ] DNS CNAME レコードの設定
- [ ] SSL証明書の自動発行確認

## ✅ 最終確認

- [ ] 全ての機能が正常に動作
- [ ] 認証フローの確認
- [ ] データベース接続の確認
- [ ] 外部API連携の確認（LINE, Sentry等）
- [ ] エラー監視の設定確認
- [ ] パフォーマンスの確認

## 🔗 便利なコマンド

```bash
# ローカルでCloudflareビルドをテスト
npm run build:cloudflare

# Supabase本番環境デプロイ
./scripts/deploy-supabase.sh production

# 型定義の再生成
npm run types
```

## 📞 サポート

問題が発生した場合は、以下を確認してください：
- GitHub Actionsのログ
- Cloudflare Pagesのデプロイログ  
- Supabase ダッシュボードのログ
- `docs/cloudflare-supabase-deployment.md` の詳細ガイド
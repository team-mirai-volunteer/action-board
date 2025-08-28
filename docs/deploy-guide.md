# デプロイガイド

アクションボードのデプロイ手順書です。本番環境とステージング環境への最低限のデプロイ手順を説明します。

## アーキテクチャ概要

- **インフラ**: Google Cloud Platform
- **デプロイ**: Cloud Run + Cloud Build
- **IaC**: Terraform Cloud
- **データベース**: Supabase
- **モニタリング**: Sentry

## 前提条件

### 必要なアクセス権限

1. **Terraform Cloud**
   - [Terraform Cloud Workspaces](https://app.terraform.io/app/gamification/workspaces) への招待
   - Staging/Production環境への実行権限

2. **Google Cloud Platform**
   - プロジェクトへのViewer以上の権限
   - Cloud Build、Cloud Runへのアクセス

3. **GitHub**
   - リポジトリへのPush権限
   - Actions実行権限

### 必要なツール

- Git
- Node.js 22以上
- Supabase CLI
- Terraform CLI（オプション）

## 環境構成

| 環境 | Terraform Workspace | 対応ブランチ | 管理者 |
|------|-------------------|------------|--------|
| **Staging** | `action-board-staging` | `release/infra/develop` | 開発チーム |
| **Production** | `action-board-production` | `release/infra/production` | PM承認 |

## デプロイ手順

### 1. コード変更とPR作成

```bash
# 1. 機能ブランチで開発
git checkout develop
git pull origin develop
git checkout -b feat/your-feature

# 2. 開発・テスト
npm run biome:check:write  # コード品質チェック
npm run test              # 全テスト実行
npm run build            # ビルドチェック

# 3. PR作成
git add .
git commit -m "feat: 機能の説明"
git push origin feat/your-feature
# GitHub上でPR作成
```

### 2. ステージング環境デプロイ

```bash
# 1. developブランチにマージ後
git checkout develop
git pull origin develop

# 2. release/infra/developブランチに反映
git checkout release/infra/develop
git merge develop
git push origin release/infra/develop
```

**Terraform Cloudでの操作:**
1. [Staging Workspace](https://app.terraform.io/app/gamification/workspaces/action-board-staging) にアクセス
2. 自動実行される`Plan`を確認
3. 問題なければ`Apply`を手動実行

### 3. 本番環境デプロイ

```bash
# 1. mainブランチに統合
git checkout main
git pull origin main
git merge develop
git push origin main

# 2. release/infra/productionブランチに反映
git checkout release/infra/production
git merge main
git push origin release/infra/production
```

**Terraform Cloudでの操作:**
1. [Production Workspace](https://app.terraform.io/app/gamification/workspaces/action-board-production) にアクセス
2. 自動実行される`Plan`をレビュー
3. **PM承認後**に`Apply`を実行

## 環境変数管理

### 新規環境変数追加

#### 通常の環境変数の場合

1. **terraform/variables.tf** に変数定義追加
2. **nextjs-app/variables.tf** に変数追加
3. **nextjs-app/cloud_build.tf** の`substitutions`に追加
4. **cloudbuild.yaml** の`arg`に追加（Dockerビルド時）

#### 秘匿情報の場合

1. **nextjs-app/secrets.tf** にSecret定義追加
2. **nextjs-app/cloud_build.tf** でSecret権限設定
3. **cloudbuild.yaml** の`secretEnv`に追加

### Terraform Cloud変数登録

環境別に以下で変数を設定（秘匿情報は`sensitive`チェック）:

- [Staging Variables](https://app.terraform.io/app/gamification/workspaces/action-board-staging/variables)
- [Production Variables](https://app.terraform.io/app/gamification/workspaces/action-board-production/variables)

## データベース関連

### Supabaseマイグレーション

新しいマイグレーションは自動的にデプロイ時に実行されます:

```bash
# ローカルでテスト
supabase migration new add_new_table
# マイグレーションファイル編集後
supabase migration up

# 型定義生成
npm run types
```

### ミッションデータ同期

デプロイ時に以下が自動実行されます:

1. **Supabaseマイグレーション** - スキーマ更新
2. **ミッションデータ同期** - `mission_data/`の内容をDB反映
3. **ポスターデータ読み込み** - `poster_data/`の内容をDB反映

## デプロイ後確認

### 1. サービス稼働確認

```bash
# ヘルスチェック
curl https://your-domain.com/api/health

# 主要ページの確認
curl -I https://your-domain.com/
curl -I https://your-domain.com/missions
```

### 2. ログ確認

- **Cloud Build**: [Build History](https://console.cloud.google.com/cloud-build/builds)
- **Cloud Run**: [Service Logs](https://console.cloud.google.com/run)
- **Sentry**: エラーモニタリング

### 3. データベース確認

```bash
# マイグレーション状況確認
supabase migration list --remote

# データ整合性確認
supabase db shell
```

## トラブルシューティング

### ビルドエラー

```bash
# ローカルで再現確認
npm ci
npm run build

# 環境変数確認
echo $NEXT_PUBLIC_SUPABASE_URL
```

### デプロイエラー

1. **Cloud Build ログ確認**
2. **Terraform Plan エラー確認**
3. **秘匿情報の設定確認**

### ロールバック手順

```bash
# 前回の安定版にロールバック
git checkout release/infra/production
git reset --hard HEAD~1
git push --force-with-lease origin release/infra/production
```

## 緊急時対応

### 障害発生時

1. **Sentryでエラー状況確認**
2. **Cloud Runサービス停止（必要に応じて）**
3. **ロールバック実行**
4. **原因調査・修正**

### メンテナンス時

```bash
# メンテナンスページ表示
# maintenance-mode ブランチをデプロイ
git checkout maintenance-mode
git push origin release/infra/production
```

## チェックリスト

### デプロイ前

- [ ] 全テストがパス
- [ ] ビルドが成功
- [ ] マイグレーションテスト完了
- [ ] 環境変数設定確認
- [ ] PM承認（本番のみ）

### デプロイ後

- [ ] サービス稼働確認
- [ ] 主要機能動作確認
- [ ] エラーログ確認
- [ ] パフォーマンス確認
- [ ] データ整合性確認

## 参考リンク

- [Terraform Cloud](https://app.terraform.io/app/gamification/workspaces)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Supabase Dashboard](https://app.supabase.com/)
- [Sentry Dashboard](https://sentry.io/)
- [本READMEファイル](../README.md)
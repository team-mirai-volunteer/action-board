# AGENTS.md

このファイルは、このリポジトリでコードを操作する際のAIエージェントへの指針を提供します。

## 開発コマンド

### ローカル開発環境セットアップ
- `supabase start` - ローカルSupabase環境を開始
- `supabase db reset` - マイグレーションとシードデータでローカルデータベースをリセット
- `npm run dev` - Next.js開発サーバーを開始 (localhost:3000)

### コード品質とテスト
- `npm run biome:check:write` - Biomeフォーマッターとリンターを自動修正付きで実行
- `npm run test` - 全テストを実行 (Jest + Playwright)
- `npm run test:unit` - ユニットテストのみ実行 (RLSテストを除く)
- `npm run test:rls` - Supabase RLS (行レベルセキュリティ) テストのみ実行
- `npm run test:e2e` - Playwright E2Eテストを実行
- `npm run test:e2e:ui` - デバッグ用UIモードでE2Eテストを実行
- `npm run test:e2e:debug` - デバッグモードでE2Eテストを実行
- `npm run test:ci:unit` - CI用ユニットテスト (JUnit形式レポート出力)
- `npm run test:ci:e2e` - CI用E2EとRLSテスト

### データベース型生成とマイグレーション
- `npm run types` - SupabaseスキーマからTypeScript型を生成 (lib/types/supabase.tsに出力)
- `npx supabase migration new <migration_name>` - 新しいマイグレーションファイルを作成
- `npx supabase migration up` - ローカルデータベースにマイグレーションを適用
- `npx supabase db reset` - マイグレーションとシードデータでローカルデータベースをリセット

### ビルドとデプロイメント
- `npm run build` - 本番用Next.jsアプリケーションをビルド
- `npm run start` - 本番サーバーを開始
- `npm run typecheck` - TypeScriptの型チェックを実行 (ビルドなし)

### ミッションデータ管理
- `npm run mission:sync` - YAMLファイルからミッションデータをデータベースに同期
- `npm run mission:sync:dry` - ドライラン (変更内容の確認のみ)
- `npm run mission:export` - データベースからミッションデータをエクスポート

### ポスターデータ管理
- `npm run poster:load-csv` - CSVファイルからポスターデータをロード
- `npm run poster:auto-load` - Google Driveから自動ロードして名前をマスク
- `npm run poster:auto-load:log` - ログ付きで自動ロード
- `npm run poster:clear` - ポスターデータをクリア
- `npm run poster:mask-names` - ポスターデータの名前をマスク

### その他のスクリプト
- `npm run calculate-badges` - バッジの計算スクリプトを実行
- `npm run export-users-prefecture` - ユーザーの都道府県データをエクスポート

## プロジェクトアーキテクチャ

### 設計思想
このプロジェクトは **bulletproof-react** の思想に基づいて構築されています：
- **機能ベースのディレクトリ構造** - 機能単位でコード整理
- **責任の分離** - services、utils、componentsの明確な分離
- **再利用性の向上** - 共通コンポーネントとユーティリティの適切な配置
- **依存関係の明確化** - インポートパスで責務を明確に表現

### 主要技術スタック
- **フレームワーク**: Next.js 15 with App Router
- **データベース**: Supabase (PostgreSQL with RLS)
- **スタイリング**: Tailwind CSS with Radix UI components
- **認証**: Supabase Auth (Email/Password, LINE Login)
- **エラー監視**: Sentry
- **コード品質**: Biome (formatter/linter), Lefthook (git hooks)
- **テスト**: Jest (unit/RLS), Playwright (E2E)
- **型安全性**: TypeScript (strict mode), Zod (validation)

### 主要ディレクトリ構造

#### `/src/app` - Next.js App Router
- `(auth-pages)/` - 認証ルート (sign-in, sign-up, forgot-password)
  - Two-Step Signup フロー実装
  - Email/Password認証とLINE Login統合
- `(protected)/` - 認証が必要な保護されたルート
  - `settings/profile/` - プロフィール設定、アカウント削除
- `missions/[id]/` - ミッション詳細ページ
  - 成果物提出フォーム
  - クイズシステム統合
  - ソーシャル共有機能
- `users/[id]/` - ユーザープロフィールページ
- `ranking/` - ランキングページ (総合、ミッション別、都道府県別)
- `seasons/[slug]/` - シーズン別ランキング
- `map/` - マップ機能
  - `poster/` - ポスター掲示板マップ
  - `posting/` - 機関誌配布マップ
- `api/` - API Routes
  - `auth/callback/line/` - LINE Login コールバック
  - `batch/` - バッチ処理エンドポイント
  - `missions/[id]/og/` - OGP画像生成

#### `/src/components` - 再利用可能なUIコンポーネント
- `ui/` - shadcn/uiベースコンポーネントのみ（純粋なUIプリミティブ）
- `common/` - アプリケーション横断で使用される共通コンポーネント
- `footer/` - フッター専用コンポーネント群
- `top/` - トップページ専用コンポーネント

#### `/src/lib` - 共有ライブラリ
- `supabase/` - Supabaseクライアント設定
- `types/` - TypeScript型定義
- `validation/` - Zodバリデーションスキーマ
- `services/` - 外部サービス統合・ビジネスロジック（hubspot.ts, mail.ts, avatar.ts, seasons.ts）
- `utils/` - 汎用ユーティリティ関数（date-formatters.ts, metadata.ts, date-utils.ts等）
- `constants/` - アプリケーション定数

#### `/src/features` - 機能ベースのディレクトリ構造
各機能は独立したディレクトリとして整理され、以下の構造を持ちます：
- `components/` - 機能固有のコンポーネント
- `services/` - 機能固有のビジネスロジック・データアクセス
- `types/` - 機能固有の型定義
- `actions/` - Server Actions（必要に応じて）
- `hooks/` - カスタムフック（必要に応じて）
- `utils/` - 機能固有のユーティリティ（必要に応じて）

主要な機能モジュール：
- `auth/` - 認証関連
- `missions/` - ミッション機能
- `mission-detail/` - ミッション詳細機能
- `ranking/` - ランキング機能
- `user-profile/` - ユーザープロフィール
- `user-settings/` - ユーザー設定
- `user-activity/` - ユーザー活動
- `metrics/` - メトリクス表示
- `map-poster/` - ポスターマップ
- `map-posting/` - 投稿マップ
- その他多数

#### `/tests` - テストインフラストラクチャ
- `e2e/` - Playwright E2Eテスト
  - 認証フロー、ミッション完了、ランキング遷移など
- `rls/` - Supabase RLSポリシーテスト
  - 各テーブルのCRUD権限を網羅的にテスト
- `unit/` - ユニットテスト
  - ポスターボード最適化、進捗計算など
- `validation/` - バリデーションスキーマのテスト

#### `/supabase` - Supabase設定
- `migrations/` - データベースマイグレーション
- `seed.sql` - 開発用シードデータ
- `config.toml` - Supabase設定

#### `/mission_data` - ミッションデータ管理
- `missions.yaml` - ミッション定義
- `categories.yaml` - カテゴリー定義
- `category_links.yaml` - カテゴリーとミッションの紐付け
- `quiz_questions.yaml` - クイズ問題定義
- `src/sync.ts` - データベース同期スクリプト

### データベーススキーマとセキュリティ

#### 主要テーブル
- **ユーザー関連**
  - `private_users` - 非公開ユーザー情報
  - `public_user_profiles` - 公開プロフィール
  - `user_levels` - レベルとXP (シーズン対応)
  - `xp_transactions` - XP取得履歴
- **ミッション関連**
  - `missions` - ミッション定義
  - `achievements` - ミッション達成記録
  - `mission_artifacts` - 提出成果物
  - `mission_category_link` - カテゴリー紐付け
- **クイズシステム**
  - `quiz_questions` - クイズ問題
  - `quiz_categories` - クイズカテゴリー
- **ポスター/投稿関連**
  - `poster_boards` - ポスター掲示板情報
  - `poster_activities` - ポスター活動記録
  - `posting_activities` - 機関誌投稿活動
- **その他**
  - `user_badges` - 獲得バッジ
  - `seasons` - シーズン定義

#### RLSポリシー
- 全テーブルでRLS有効
- 認証ユーザーのみアクセス可能
- 自分のデータのみ更新可能
- `/tests/rls/`で網羅的にテスト

### 認証フロー

#### Two-Step Signup
1. **フェーズ1**: 基本情報入力 (メール、パスワード、利用規約同意)
2. **フェーズ2**: プロフィール情報入力 (名前、都道府県など)

#### LINE Login統合
- OAuth 2.0フロー実装
- `/api/auth/callback/line/`でコールバック処理
- 既存アカウントとの紐付け対応

### ミッションシステム

#### 成果物タイプ
- `LINK` - URL提出
- `TEXT` - テキスト提出
- `IMAGE` - 画像アップロード
- `IMAGE_WITH_GEOLOCATION` - 位置情報付き画像
- `POSTER` - ポスター掲示活動
- `POSTING` - 機関誌配布活動
- `EMAIL` - メールアドレス提出
- `NONE` - 提出不要

#### 特殊ミッションタイプ
- `QUIZ` - クイズ形式
- `LINK_ACCESS` - リンクアクセスで完了

### シーズンシステム
- 期間限定のランキングとXP集計
- `seasons`テーブルで管理
- シーズン別ランキング関数実装

### ユーザーレベルとXPシステム
- ミッション完了でXP獲得
- 自動レベルアップ通知
- シーズン対応のXP集計
- 紹介システムによるボーナスXP

## 環境設定

必須環境変数 (`.env.example`を参照):
- **Supabase**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- **認証**
  - `LINE_CLIENT_SECRET`
  - `NEXT_PUBLIC_LINE_CLIENT_ID`
- **監視・分析**
  - `NEXT_PUBLIC_SENTRY_DSN`
  - `NEXT_PUBLIC_GA_ID`
- **バッチ処理**
  - `BATCH_ADMIN_KEY`
- **外部連携**
  - `HUBSPOT_API_KEY` (オプション)
  - `MAILGUN_API_KEY` (メール送信用)

## 開発ワークフロー

### ブランチ戦略
- `main` - 本番準備完了コード
- `develop` - 機能統合ブランチ (PRのデフォルトブランチ)
- `feat/xxx` - 機能ブランチ (`develop`から分岐、`develop`にマージ)

### コード品質ツール
- **Biome**: フォーマットとリンティング
  - インデント: スペース2つ
  - クォート: ダブルクォート
  - import文の自動整理
- **Lefthook**: pre-commitフック
  - コミット時に自動フォーマット
- **TypeScript**: strictモード有効
  - `@/*`パスエイリアス設定済み

### テスト戦略

#### ユニットテスト (Jest)
- カバレッジ目標: 80%以上
- テストファイル: `*.test.ts(x)`
- モック: `tests/__mocks__/`

#### RLSテスト
- 各テーブルのCRUD権限をテスト
- テストユーザー作成・削除を自動化
- `npm run test:rls`で実行

#### E2Eテスト (Playwright)
- 主要ユーザーフローをカバー
- デスクトップ・モバイルデバイス対応
- リトライ設定: 2回
- トレース: 失敗時のみ

### マイグレーション追加手順
1. `supabase migration new {名前}` - 新規マイグレーションファイル作成
2. SQLを記述
3. `supabase migration up` - ローカルに適用
4. `npm run types` - TypeScript型を再生成

### 重要な開発ノート
- **データベーススキーマ変更後は必ず `npm run types` を実行**
- **新規ミッション登録時は `mission_category_link` への登録が必須**
- **RLSポリシーは必ずテストを書く**
- **環境変数の追加時は `.env.example` も更新**
- **CI/CDではCloud Buildでミッションデータが自動同期される**

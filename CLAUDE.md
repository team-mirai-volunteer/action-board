# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

このファイルは、このリポジトリでコードを操作する際のClaude Code (claude.ai/code) への指針を提供します。

## 開発コマンド

### ローカル開発環境セットアップ
- `supabase start` - ローカルSupabase環境を開始
- `supabase db reset` - マイグレーションとシードデータでローカルデータベースをリセット
- `npm run dev` - Next.js開発サーバーを開始 (localhost:3000)

### コード品質とテスト
- `npm run biome:check:write` - Biomeフォーマッターとリンターを自動修正付きで実行
- `npm run test` - 全テストを実行 (Jest + Playwright)
- `npm run test:rls` - Supabase RLS (行レベルセキュリティ) テストのみ実行
- `npm run test:e2e` - Playwright E2Eテストを実行
- `npm run test:e2e:ui` - デバッグ用UIモードでE2Eテストを実行
- `npm run test:e2e:debug` - デバッグモードでE2Eテストを実行
- `npm run test:ci` - GitHub Actions用CIレポーター付きでテストを実行

### データベース型生成
- `npm run types` - SupabaseスキーマからTypeScript型を生成 (lib/types/supabase.tsに出力)

### ビルドとデプロイメント
- `npm run build` - 本番用Next.jsアプリケーションをビルド
- `npm run start` - 本番サーバーを開始

### Storybook
- `npm run storybook` - Storybook開発サーバーを開始 (localhost:6006)
- `npm run build-storybook` - 本番用Storybookをビルド

## プロジェクトアーキテクチャ

### 主要技術スタック
- **フレームワーク**: Next.js 15 with App Router
- **データベース**: Supabase (PostgreSQL with RLS)
- **スタイリング**: Tailwind CSS with Radix UI components
- **認証**: Supabase Auth
- **エラー監視**: Sentry
- **コード品質**: Biome (formatter/linter), Lefthook (git hooks)
- **テスト**: Jest (unit/RLS), Playwright (E2E), Storybook (component)

### 主要ディレクトリ構造

#### `/app` - Next.js App Router
- `(auth-pages)/` - 認証ルート (sign-in, sign-up, forgot-password)
- `(protected)/` - 認証が必要な保護されたルート
- `missions/[id]/` - 提出機能付きミッション詳細ページ
- `users/[id]/` - ユーザープロフィールページ

#### `/components` - 再利用可能なUIコンポーネント
- `ui/` - ベースUIコンポーネント (Radix UIベース)
- `mission/` - ミッション固有のコンポーネント
- `ranking/` - ランキングシステムコンポーネント

#### `/lib` - 共有ユーティリティ
- `supabase/` - データベースクライアント設定とミドルウェア
- `types/` - TypeScript型定義 (Supabaseから自動生成)
- `validation/` - Zodバリデーションスキーマ
- `services/` - ビジネスロジックとデータアクセス

#### `/tests` - テストインフラストラクチャ
- `e2e/` - Playwright エンドツーエンドテスト
- `rls/` - Supabase 行レベルセキュリティポリシーテスト
- `validation/` - バリデーションスキーマのユニットテスト

### データベーススキーマとセキュリティ
- 行レベルセキュリティ (RLS) が有効なSupabaseを使用
- 主要テーブル: `missions`, `achievements`, `private_users`, `public_user_profiles`, `user_levels`, `xp_transactions`
- RLSポリシーは `/tests/rls/` で広範囲にテスト
- 生成されたTypeScript型による型安全性の強化

### 認証フロー
- Supabase Authがユーザー登録、ログイン、セッション管理を処理
- LINE Loginサポート (`/auth/callback/line/`, `/auth/line-callback/`)
- ミドルウェア (`middleware.ts`) が各リクエストでセッション更新を管理
- 保護されたルートはSupabaseのセッションベース認証を使用

### コンポーネントアーキテクチャ
- Radix UIがスタイルなしでアクセシブルなベースコンポーネントを提供
- カスタムテーマ設定でTailwind CSSによるスタイリング
- shadcn/uiパターンに従うコンポーネント構成
- コンポーネント開発とドキュメント用のStorybook

### ミッションシステム
- ユーザーがミッション用の成果物を提出できる中核機能
- 位置情報サポート付き画像アップロード機能
- 達成追跡とユーザープロフィール統合
- ソーシャル共有機能 (Facebook, Twitter, LINE)
- 成果物タイプ: LINK, TEXT, IMAGE, IMAGE_WITH_GEOLOCATION, NONE

### ユーザーレベルとXPシステム
- `xp_transactions`テーブルを通じた経験値 (XP) 追跡
- 自動レベルアップ通知付きレベル進行
- リーダーボード付きランキングシステム
- ユーザー獲得のための紹介システム

## 環境設定

必須環境変数 (`.env.example`を参照):
- `NEXT_PUBLIC_SUPABASE_URL` - SupabaseプロジェクトURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase匿名キー
- `SUPABASE_SERVICE_ROLE_KEY` - Supabaseサービスロールキー (サーバー操作用)
- `NEXT_PUBLIC_SENTRY_DSN` - Sentryエラー監視DSN
- `NEXT_PUBLIC_GA_ID` - Google Analyticsトラッキング ID
- `LINE_CLIENT_SECRET` - LINE Login用チャンネルシークレット
- `NEXT_PUBLIC_LINE_CLIENT_ID` - LINE Login用チャンネルID
- `BATCH_ADMIN_KEY` - バッチ処理API用の管理者キー

## 開発ワークフロー

### ブランチ戦略
- `main` - 本番準備完了コード
- `develop` - 機能統合ブランチ (PRのデフォルトブランチ)
- `feat/xxx` - 機能ブランチ (`develop`から分岐、`develop`にマージ)

### コード品質ツール
- Biomeがフォーマットとリンティングを処理 (`biome.json`で設定)
- Lefthookがコード品質のためのpre-commitフックを実行
- TypeScript strictモードが有効
- パスエイリアス設定 (`@/*` がプロジェクトルートにマップ)

### テスト戦略
- **ユニットテスト**: バリデーションロジックとユーティリティ用Jest
- **RLSテスト**: セキュリティポリシー用直接Supabaseテスト
- **E2Eテスト**: ユーザーワークフロー用Playwright
- **コンポーネントテスト**: UIコンポーネント分離用Storybook

### 重要な開発ノート
- **データベーススキーマ変更後は必ず `npm run types` を実行** - Supabaseスキーマから型定義を再生成
- Pre-commitフックがBiomeで自動的にコードをフォーマット
- 新しいデータベーステーブルにはRLSポリシーのテストが必須
- 新しいUIコンポーネントにはStorybookストーリーを作成
- 新しいベースコンポーネントは `/components/ui/` の既存パターンに従う
- コード変更後は `npm run biome:check:write` で自動修正を実行
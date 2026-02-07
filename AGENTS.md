# AGENTS.md

このファイルは、このリポジトリでコードを操作する際のAIエージェントへの指針を提供します。

## 並列PR作成ルール
複数の独立したPRを作成する必要がある場合は、`/parallel-pr` スキルを使用して git worktree + エージェントチームで並列に作業すること。
詳細は `docs/20260206_1437_並列worktreeチーム運用ガイド.md` を参照。

## 要件定義、実装計画のルール
要件定義や実装計画を依頼された場合は、最初に論点を洗い出して、ユーザーに質問をしながら論点をクリアにしてください。 論点がクリアになったら、マークダウンでドキュメントを作成すること。

## ドキュメント管理ルール
設計作業などのドキュメント作成を依頼された場合は、以下のルールに従ってファイルを作成すること：

ファイル名: YYYYMMDD_HHMM_{日本語の作業内容}.md
保存場所: docs/ 以下
フォーマット: Markdown
例: docs/20250815_1430_ユーザー認証システム設計.md

## 開発コマンド

### ローカル開発環境セットアップ
- `supabase start` - ローカルSupabase環境を開始
- `pnpm run db:reset` - データベースリセット + 型生成 + ミッションデータ同期 + シードデータ投入を一括実行
- `pnpm run dev` - Next.js開発サーバーを開始 (localhost:3000)

### コード品質とテスト
- `pnpm run biome:check:write` - Biomeフォーマッターとリンターを自動修正付きで実行
- `pnpm run test` - 全テストを実行 (Jest + Playwright)
- `pnpm run test:unit` - ユニットテストのみ実行 (RLSテストを除く)
- `pnpm run test:supabase` - Supabase (RLS, DB Function) テストのみ実行
- `pnpm run test:e2e` - Playwright E2Eテストを実行
- `pnpm run test:e2e:ui` - デバッグ用UIモードでE2Eテストを実行
- `pnpm run test:e2e:debug` - デバッグモードでE2Eテストを実行
- `pnpm run test:ci:unit` - CI用ユニットテスト (JUnit形式レポート出力)
- `pnpm run test:ci:e2e` - CI用E2EとRLSテスト

### データベース型生成とマイグレーション
- `pnpm run db:reset` - データベースリセット + 型生成 + ミッションデータ同期 + シードデータ投入を一括実行
- `pnpm run db:migrate` - マイグレーション適用 + 型生成
- `pnpm run types` - SupabaseスキーマからTypeScript型を生成 (lib/types/supabase.tsに出力)
- `npx supabase migration new <migration_name>` - 新しいマイグレーションファイルを作成

### ビルドとデプロイメント
- `pnpm run build` - 本番用Next.jsアプリケーションをビルド
- `pnpm run start` - 本番サーバーを開始
- `pnpm run typecheck` - TypeScriptの型チェックを実行 (ビルドなし)

### ミッションデータ管理
- `pnpm run mission:sync` - YAMLファイルからミッションデータをデータベースに同期
- `pnpm run mission:sync:dry` - ドライラン (変更内容の確認のみ)
- `pnpm run mission:export` - データベースからミッションデータをエクスポート

### ポスターデータ管理
- `pnpm run poster:load-csv` - CSVファイルからポスターデータをロード
- `pnpm run poster:auto-load` - Google Driveから自動ロードして名前をマスク
- `pnpm run poster:auto-load:log` - ログ付きで自動ロード
- `pnpm run poster:clear` - ポスターデータをクリア
- `pnpm run poster:mask-names` - ポスターデータの名前をマスク

### YouTubeデータ管理
- `pnpm --filter @action-board/youtube-data sync` - YouTube動画データをデータベースに同期
- `pnpm --filter @action-board/youtube-data sync:dry` - ドライラン (変更内容の確認のみ)

### その他のスクリプト
- `pnpm run calculate-badges` - バッジの計算スクリプトを実行
- `pnpm run export-users-prefecture` - ユーザーの都道府県データをエクスポート

## プロジェクトアーキテクチャ

### 設計思想
このプロジェクトは **bulletproof-react** の思想に基づいて構築されています：
- **機能ベースのディレクトリ構造** - 機能単位でコード整理
- **責任の分離** - services、utils、componentsの明確な分離
- **再利用性の向上** - 共通コンポーネントとユーティリティの適切な配置
- **依存関係の明確化** - インポートパスで責務を明確に表現

### データアクセスのルール
**UIコンポーネント（`.tsx`ファイル）からSupabaseを直接呼び出してはいけません。**

#### 正しいパターン
```typescript
// components/example.tsx
import { getData } from "../services/example";

const data = await getData(); // Service層経由でアクセス
```

#### 禁止パターン
```typescript
// components/example.tsx
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const { data } = await supabase.from("table").select(); // NG: 直接アクセス
```

#### 理由
1. **責務の分離**: UIはデータの表示に専念し、データ取得ロジックはService層に集約
2. **テスタビリティ**: Service層をモック化することでUIのテストが容易に
3. **保守性**: データアクセスロジックの変更がUIに影響しない
4. **一貫性**: 同じデータ取得ロジックを複数のコンポーネントで再利用可能

#### 配置場所
- `src/features/{機能名}/services/` - 機能固有のデータアクセス
- `src/lib/services/` - 共通のデータアクセス

### Supabaseクライアントの使い分けルール

詳細は [docs/20260206_2220_Supabaseクライアント使い分けガイド.md](docs/20260206_2220_Supabaseクライアント使い分けガイド.md) を参照。

- **`createClient()` / `getAuth()` / `getStorage()`**: 認証操作（`supabase.auth.*`）やStorage操作に使用。cookie連携あり。
- **`createAdminClient()`**: DB操作（`supabase.from(...)`）に使用。service_roleでRLSバイパス。
- **`createAdminClient()` で `supabase.auth.*` を呼んではいけない**（cookieが読めずセッション取得失敗）
- **クライアントコンポーネントからDB操作を呼ぶ場合**: `actions/`（mutation）または `loaders/`（読み取り）経由。`services/` を直接importしない。

### 認可（Authorization）のルール

- **userIdは必ずサーバーサイドでセッションから取得する**。クライアントからuserIdを引数で受け取ってはいけない（改ざん可能なため）。
- **認可チェックはactions層で行う**。services層はデータ操作に専念し、認可ロジックを混在させない。
- **リソースの所有者チェックは専用の認可関数に分離する**。サービス関数のクエリに `.eq("user_id", userId)` を埋め込むのではなく、`authorizeXxxOwner()` のような関数で事前に所有権を検証する。


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
  - `posting/` - ポスティングマップ
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

#### `/packages` - pnpmワークスペースパッケージ
- `youtube_data/` - YouTube Data API連携パッケージ
  - `src/sync.ts` - YouTube動画同期スクリプト
  - `src/youtube-client.ts` - YouTube APIクライアント
  - `src/types.ts` - 型定義

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
- **YouTube関連**
  - `youtube_videos` - YouTube動画マスターデータ
  - `youtube_video_stats` - 動画統計情報の日次スナップショット
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
  - `YOUTUBE_API_KEY` (YouTube動画同期用)

## 開発ワークフロー

### ブランチ戦略
- `main` - 本番準備完了コード
- `develop` - 機能統合ブランチ (PRのデフォルトブランチ)
- `feat/xxx` - 機能ブランチ (`develop`から分岐、`develop`にマージ)

### Worktree必須ルール
コード変更を伴う作業は、必ず git worktree を作成してから開始すること。メインのリポジトリディレクトリでは直接コード変更を行わない。

- **目的**: developブランチを常にクリーンに保ち、作業の分離と並列作業を容易にする
- **例外**: ドキュメント作成のみの作業、CLAUDE.mdの更新など、コードに影響しない変更

### Git Worktree作成手順 (Claude Code向け)
Claude Codeで作業を開始する場合は、以下の手順に従うこと：

```bash
# 1. worktreeを作成
git worktree add ../action-board-<branch-name> -b <branch-name>

# 2. .claudeディレクトリを作成し、settings.local.jsonをコピー
mkdir -p ../action-board-<branch-name>/.claude
cp .claude/settings.local.json ../action-board-<branch-name>/.claude/
```

**重要**: `settings.local.json`には権限設定が含まれているため、コピーしないとworktree内でのファイル操作時に毎回permission確認が発生する。

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
- `pnpm run test:supabase`で実行

#### E2Eテスト (Playwright)
- 主要ユーザーフローをカバー
- デスクトップ・モバイルデバイス対応
- リトライ設定: 2回
- トレース: 失敗時のみ

### マイグレーション追加手順
1. `npx supabase migration new {名前}` - 新規マイグレーションファイル作成
2. SQLを記述
3. `pnpm run db:migrate` - ローカルに適用 + 型を再生成

### 重要な開発ノート
- **データベーススキーマ変更後は必ず `pnpm run types` を実行**
- **新規ミッション登録時は `mission_category_link` への登録が必須**
- **RLSポリシーは必ずテストを書く**
- **環境変数の追加時は `.env.example` も更新**
- **CI/CDではCloud Buildでミッションデータが自動同期される**

## 自己学習ルール
セッション中の発見やPRレビューのフィードバックを、プロジェクト設定に自動反映する仕組み。

- **PRレビュー後**: `/retro {PR番号}` でCodeRabbit・レビュアーの指摘を分析し、CLAUDE.md・skills・agents・MEMORYに反映する
- **セッション終了時**: SessionEndフックがMEMORY.mdの差分を `.claude/tmp/learnings-staging.md` に自動キャプチャする
- **次セッション開始時**: SessionStartフックが未処理の学びを通知する。`/retro` で反映する
- **学びの分類先**:
  - 普遍ルール（フレームワーク制約、ファイル配置等）→ CLAUDE.md
  - ワークフロー改善 → skills/commands
  - ワーカー行動指針 → agents
  - 運用知識・ワークアラウンド → MEMORY.md

## GitHub Issue作成ルール
GitHub Issueを作成する際は、以下のルールに従うこと：

- プラン内容を簡略化せず、そのままissueに記載する
- コード例、SQL、型定義などの詳細な実装内容を含める
- 検証方法を具体的に記載する

## Pull Request作成ルール
Pull Requestを作成する際は、以下のルールに従うこと：

- PRの説明文に `Resolves #issue番号` を必ず記載し、マージ時に対応するissueが自動的にクローズされるようにする
  - 例: `Resolves #123`
  - 複数のissueをクローズする場合は、それぞれ別の行に記載する
    - 例: `Resolves #123`、`Resolves #456`

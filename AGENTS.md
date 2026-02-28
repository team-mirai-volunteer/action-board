# AGENTS.md

このファイルは、このリポジトリでコードを操作する際のAIエージェントへの指針を提供します。

## 必須ルール

### Worktree必須
コード変更を伴う作業は、**必ず git worktree を作成してから開始すること**。メインのリポジトリディレクトリでは直接コード変更を行わない。

```bash
# 1. worktreeを作成
git worktree add ../action-board-<branch-name> -b <branch-name>

# 2. settings.local.jsonをコピー（権限設定のため必須）
mkdir -p ../action-board-<branch-name>/.claude
cp .claude/settings.local.json ../action-board-<branch-name>/.claude/

# 3. 環境変数ファイルをコピー（dev server起動に必須）
cp .env ../action-board-<branch-name>/
```

- **目的**: developブランチを常にクリーンに保ち、作業の分離と並列作業を容易にする
- **例外**: ドキュメント作成のみの作業、CLAUDE.mdの更新など、コードに影響しない変更

### データアクセス
**UIコンポーネント（`.tsx`ファイル）からSupabaseを直接呼び出してはいけない。** Service層（`services/`）経由でアクセスすること。
コード例・配置場所の詳細は [アーキテクチャガイドライン](docs/nextjs_architecture_guidelines.md) を参照。

### ミッション・ポスティングイベント・シーズンのデータ管理
ミッション、`posting_events`、シーズンは **YAMLファイルで宣言的に管理** されている。SQLマイグレーションで直接変更しないこと。
- `mission_data/missions.yaml` - ミッション定義（`is_featured`, `is_hidden` 等の変更もここ）
- `mission_data/categories.yaml` - カテゴリ定義
- `mission_data/category_links.yaml` - カテゴリとミッションの紐付け
- `season_data/seasons.yaml` - シーズン定義（`name`, `is_active`, `start_date`, `end_date` の変更もここ）
- CI/CDデプロイ時に `npm run mission:sync` / `npm run season:sync` で自動同期される

### Supabaseクライアントの使い分け
- **`createClient()` / `getAuth()` / `getStorage()`**: 認証操作（`supabase.auth.*`）やStorage操作に使用
- **`createAdminClient()`**: DB操作（`supabase.from(...)`）に使用。service_roleでRLSバイパス
- **`createAdminClient()` で `supabase.auth.*` を呼んではいけない**
- **クライアントコンポーネントからDB操作を呼ぶ場合**: `actions/`（mutation）または `loaders/`（読み取り）経由

詳細は [Supabaseクライアント使い分けガイド](docs/20260206_2220_Supabaseクライアント使い分けガイド.md) を参照。

### 認可（Authorization）
- **userIdは必ずサーバーサイドでセッションから取得する**（クライアントから受け取らない）
- **認可チェックはactions層で行う**（services層はデータ操作に専念）
- **リソースの所有者チェックは専用の認可関数に分離する**（`authorizeXxxOwner()` 等）

## 作業ルール

### 並列PR作成
複数の独立したPRを作成する場合は `/parallel-pr` スキルを使用すること。
詳細は [並列worktreeチーム運用ガイド](docs/20260206_1437_並列worktreeチーム運用ガイド.md) を参照。

### 要件定義・実装計画
依頼された場合は、最初に論点を洗い出してユーザーに質問しながらクリアにし、マークダウンでドキュメントを作成すること。

### 自己学習
セッション中の発見やPRレビューのフィードバックを、プロジェクト設定に自動反映する仕組み。

- **PRレビュー後**: `/retro {PR番号}` でCodeRabbit・レビュアーの指摘を分析し、CLAUDE.md・skills・agents・MEMORYに反映する
- **セッション終了時**: SessionEndフックがMEMORY.mdの差分を `.claude/tmp/learnings-staging.md` に自動キャプチャする
- **次セッション開始時**: SessionStartフックが未処理の学びを通知する。`/retro` で反映する
- **学びの分類先**:
  - 普遍ルール（フレームワーク制約、ファイル配置等）→ CLAUDE.md
  - ワークフロー改善 → skills/commands
  - ワーカー行動指針 → agents
  - 運用知識・ワークアラウンド → MEMORY.md

### ドキュメント管理
設計作業などのドキュメント作成を依頼された場合は、以下のルールに従ってファイルを作成すること：

- ファイル名: `YYYYMMDD_HHMM_{日本語の作業内容}.md`
- 保存場所: `docs/` 以下
- フォーマット: Markdown
- 例: `docs/20250815_1430_ユーザー認証システム設計.md`

### GitHub Issue作成
- プラン内容を簡略化せず、そのままissueに記載する
- コード例、SQL、型定義などの詳細な実装内容を含める
- 検証方法を具体的に記載する

### Push前の必須チェック
`git push` する前に、以下の3つを必ず実行し、全てパスすることを確認する：

1. `pnpm run biome:check:write` - フォーマット + リント
2. `pnpm run typecheck` - 型チェック（`tsc --noEmit`）
3. `pnpm run test:unit` - ユニットテスト

いずれかが失敗した場合は修正してからpushすること。

### Pull Request作成
- PRの説明文に `Resolves #issue番号` を必ず記載し、マージ時に対応するissueが自動的にクローズされるようにする
  - 例: `Resolves #123`
  - 複数のissueをクローズする場合は、それぞれ別の行に記載する
    - 例: `Resolves #123`、`Resolves #456`
- **PR作成後のCodeRabbitレビュー確認（必須）**: PR作成後、CodeRabbitのレビューが届くまで待ってからコメントを確認すること。レビューは通常2〜3分で届く。`gh api repos/{owner}/{repo}/pulls/{number}/comments` でコメントを取得し、空なら少し待って再取得する。重要な指摘（Major/Critical）があれば修正してpushすること。軽微な指摘（Minor）や既存コードとの一貫性を優先すべきものはスキップ可。

## 開発コマンド

よく使うコマンド:
- `pnpm run dev` - 開発サーバー起動
- `pnpm run biome:check:write` - フォーマット + リント
- `pnpm run test:unit` - ユニットテスト実行
- `pnpm run test:integration` - 統合テスト実行（ローカルSupabase起動が必要）

全コマンド一覧は [開発コマンドリファレンス](docs/開発コマンドリファレンス.md) を参照。

## アーキテクチャ

**設計思想**: [bulletproof-react](https://github.com/alan2207/bulletproof-react) ベースの機能単位モジュール分割

**主要技術スタック**: Next.js 15 (App Router) / Supabase / Tailwind CSS / Biome / Jest + Playwright / TypeScript (strict)

詳細は [アーキテクチャガイドライン](docs/nextjs_architecture_guidelines.md) を参照。

## ディレクトリ構造

```
src/
├── app/              # Next.js App Router（ページ・レイアウト）
├── components/       # 共通UIコンポーネント（ui/, common/）
├── features/         # 機能ベースモジュール（下記参照）
└── lib/              # 共有ライブラリ（supabase/, types/, utils/, services/）
```

各featureの構造:
```
src/features/{feature-name}/
├── components/    # UIコンポーネント
├── services/      # データアクセス・ビジネスロジック
├── actions/       # Server Actions（認可・mutation）
├── loaders/       # データ読み取り（クライアント向け）
├── use-cases/     # ユースケース（Next.js非依存のビジネスロジック）
├── hooks/         # カスタムフック
├── types/         # 型定義
├── utils/         # ユーティリティ
└── constants/     # 定数
```

### Use Case層
- **目的**: Server Actionからビジネスロジックを分離し、統合テストから直接呼び出せるようにする
- **パターン**: `SupabaseClient` を引数で受け取り、`createClient()`（Next.js cookies依存）を内部で呼ばない
- **テスト時**: `adminClient`（`tests/supabase/utils.ts`）や `createTestUser` が返す認証済みクライアントを渡す
- **配置**: `src/features/{feature-name}/use-cases/`

## プロジェクト概要

DBスキーマ、認証フロー、ミッションシステム、ディレクトリ構造の詳細は [プロジェクト概要](docs/プロジェクト概要.md) を参照。

## 開発ワークフロー

ブランチ戦略・テスト・マイグレーション・環境設定の詳細は [開発ワークフロー](docs/開発ワークフロー.md) を参照。

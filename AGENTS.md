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
```

- **目的**: developブランチを常にクリーンに保ち、作業の分離と並列作業を容易にする
- **例外**: ドキュメント作成のみの作業、CLAUDE.mdの更新など、コードに影響しない変更

### データアクセス
**UIコンポーネント（`.tsx`ファイル）からSupabaseを直接呼び出してはいけない。** Service層（`services/`）経由でアクセスすること。

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

### Pull Request作成
- PRの説明文に `Resolves #issue番号` を必ず記載し、マージ時に対応するissueが自動的にクローズされるようにする
  - 例: `Resolves #123`
  - 複数のissueをクローズする場合は、それぞれ別の行に記載する
    - 例: `Resolves #123`、`Resolves #456`

## 開発コマンド

よく使うコマンド:
- `pnpm run dev` - 開発サーバー起動
- `pnpm run biome:check:write` - フォーマット + リント
- `pnpm run test:unit` - ユニットテスト実行

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
├── hooks/         # カスタムフック
├── types/         # 型定義
├── utils/         # ユーティリティ
└── constants/     # 定数
```

## プロジェクト概要

DBスキーマ、認証フロー、ミッションシステム、ディレクトリ構造の詳細は [プロジェクト概要](docs/プロジェクト概要.md) を参照。

## 開発ワークフロー

ブランチ戦略・テスト・マイグレーション・環境設定の詳細は [開発ワークフロー](docs/開発ワークフロー.md) を参照。

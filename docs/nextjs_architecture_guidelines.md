# アーキテクチャガイドライン

## 背景と目的
現在のNext.jsアプリケーションにおいて、コードがサーバーサイドとクライアントサイドのどちらで実行されるかの判別が困難で、開発・デバッグ・レビューの認知コストが高くなっている問題を解決するため、ディレクトリ構造とコーディング規約を見直した。

### 目標
ディレクトリ構造の明確化および server-only / client-only の徹底適用
サーバーサイド実行・クライアントサイド実行の明確な判別
開発・デバッグ・レビューの認知コスト削減

## ディレクトリ構造ルール

### 基本構造
Bulletproof React の設計思想をベースとした機能単位のモジュール分割を採用。

src/
├── app/                    # Next.js App Router
│   └── [route]/
│       ├── page.tsx        # ページコンポーネント
│       └── layout.tsx      # レイアウトコンポーネント
└── features/               # 機能単位のモジュール
    └── [feature-name]/
        ├── components/     # UIコンポーネント
        ├── services/       # データアクセス層（API, DB操作, ビジネスロジック）
        ├── actions/        # Server Actions（認可処理・フォーム処理）
        ├── constants/      # 定数定義（環境非依存）
        ├── hooks/          # React Hooks
        ├── types/          # 型定義
        └── utils/          # ユーティリティ関数

### 現在の移行状況
- 新規実装：以下の `features/` ベースの構造を使用
- 既存コード：`src/components/` および `src/lib/` から段階的移行中

## 機能別ディレクトリ詳細

### 🎨 src/features/[feature-name]/components/
役割: 機能固有のUIコンポーネント
実行環境: デフォルトはサーバーコンポーネント。ただし、インタラクティブ要素がある場合はクライアントサイドで実行される。

ルール:
- ✅ インタラクティブな要素（クリック、フォーム、useState/useEffect など）を持つ場合は `'use client'` を原則として付与する
- ✅ 静的な表示のみの場合は `import 'server-only'` を明示してServer Component を推奨する。
- ✅ **Props型定義はコンポーネントファイル内に記載する**（外部ファイルでの定義禁止）
- ❌ 直接データベースアクセス禁止
- ℹ️ 備考：
  サーバーコンポーネントはデフォルトでサーバー実行されますが、明示的にサーバー処理であることを示すために必要に応じて `import 'server-only'` を使用する。
  クライアント専用ユーティリティや非 React モジュールの場合は `import 'client-only'` を使用してクライアント実行を明示する

### 🔧 src/features/[feature-name]/services/
役割: データアクセス・ビジネスロジック層
実行環境: サーバーサイド専用

ルール:
- ✅ サーバーサイド処理は `import 'server-only'` を必須付与
- ✅ データベースアクセス・外部API呼び出し
- ✅ ビジネスロジックの実装
- ❌ React Hooks・DOM操作禁止
- ℹ️ 備考：クライアント専用処理は Services ではなく utils に配置すること
- ℹ️ 備考：Server Actions は actions に配置すること

### 🎬 src/features/[feature-name]/actions/
役割: Server Actions・認可処理・フォーム処理
実行環境: サーバーサイド専用

ルール:
- ✅ ファイル先頭に `'use server'` を必須付与
- ✅ Server Actions（フォーム送信処理・mutation系処理）を実装
- ✅ 認可チェック（Authorization）を必ず行う
  - 処理対象のデータに対して、ユーザーが操作権限を持っているか確認する
- ✅ 必要に応じて services 層を呼び出してデータアクセスやビジネスロジックを利用
- ❌ 直接 DB や外部APIを叩かない（services 層に委譲）
- ❌ React Hooks・DOM操作禁止

### 🔢 src/features/[feature-name]/constants/
役割: 機能固有の定数定義
実行環境: 共通（環境非依存）

ルール:
- ✅ 環境非依存の定数のみ
- ✅ 機能固有の設定値・マジックナンバーの排除
- ✅ readonly な値の定義
- ❌ 実行時に変更される値の定義禁止
- ❌ 環境依存の値（プロセス環境変数等）の直接定義禁止

### 🎣 src/features/[feature-name]/hooks/
役割: React Hooks・クライアントサイドのロジック
実行環境: クライアントサイド専用

ルール:
- ✅ 'use client' 必須
- ✅ React Hooks・状態管理
- ✅ ブラウザAPI・DOM操作
- ❌ 直接データベースアクセス禁止

### 📝 src/features/[feature-name]/types/
役割: 機能固有の型定義
実行環境: 共通（環境非依存）

ルール:
- ✅ 環境非依存の型定義（サーバー・クライアント両方で使用可能）
- ✅ ビジネスロジック・ドメインモデルに関する型定義
- ✅ API レスポンス・リクエストの型定義
- ✅ 複数のコンポーネント・関数で共有される型定義
- ❌ **Props型定義の記載禁止**（コンポーネントファイル内に記載すること）
- ❌ 実行時コード・関数の実装禁止

### 🛠️ src/features/[feature-name]/utils/
役割: 共通的に使用される関数・ロジックの定義
実行環境: 実装内容により決定

ルール:
- ✅ 環境非依存：実行環境指定不要
- ✅ サーバー固有処理：`import 'server-only'` 必須
- ✅ クライアント固有処理：`import 'client-only'` を推奨（React を使用するモジュールのみ `'use client'`）
- ℹ️ 備考：`'use client'` はモジュール境界を広げ依存をクライアントバンドルへ巻き込みやすいため、非 UI のユーティリティでは避ける

### データフローの原則
🔄 推奨データフロー
UI Layer (components)
    ↕ Server Actions
Business Layer (services)
    ↕ Supabase Client
Data Layer (Database)

### 🔒 Supabaseセキュリティガイダンス
#### Service Role Key の取り扱い
- ❌ **禁止**: Service Role Key をクライアントサイドコードに露出
- ✅ **必須**: 管理者権限が必要な操作はサーバーサイドでのみ実行（Server Actions、API routes、serverless functions）
- ✅ **原則**: UI/componentsにはService Role Keyを渡さない

#### クライアントサイドでのデータアクセス
- ✅ **必須**: anon/public keys + Row-Level Security (RLS) を使用
- ✅ **推奨**: 特権操作はサーバープロキシパターンを使用

#### 環境変数管理
- ✅ **必須**: Service Keyを含む環境変数は `server-only` でアクセス
- ✅ **推奨**: Service Keyの定期ローテーション実施
- ✅ **必須**: server-only ヘルパー経由でのアクセス
- ✅ **重要**: クライアントで参照可能なのは `NEXT_PUBLIC_*` で始まる環境変数のみ。機密値は決して `NEXT_PUBLIC_` を付けない

```typescript
// ❌ 悪い例：クライアントでService Role Key使用
"use client";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // 露出リスク

// ✅ 良い例：サーバープロキシパターン
"use server";
import { createServiceClient } from '@/lib/supabase/service';
export async function privilegedOperation() {
  const supabase = createServiceClient(); // server-only
  return await supabase.from('admin_table').select('*');
}
```

## 📋 チェックリスト
### ファイル作成時
- 適切なディレクトリに配置しているか
- 実行環境を明示しているか（原則として 'use client' / 'use server' / server-only / client-only を利用する）
- 依存関係が適切か（UIがサービス層経由でデータアクセスしているか）

### コードレビュー時
- 実行環境の指定が適切
- ディレクトリ配置が規約に従っている
- データフローが推奨パターンに従っている
- 禁止されたAPI使用がない
- 絶対パス（@/）の使用推奨

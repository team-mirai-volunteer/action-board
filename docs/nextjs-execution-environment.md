# Architecture Guidelines

## 背景と目的
現在のNext.jsアプリケーションにおいて、コードがサーバーサイドとクライアントサイドのどちらで実行されるかの判別が困難で、開発・デバッグ・レビューの認知コストが高くなっている問題を解決するため、ディレクトリ構造とコーディング規約を見直した。

### 目標:
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
        ├── services/       # データアクセス層
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
✅ インタラクティブな要素（クリック、フォーム、useState/useEffect など）を持つ場合は 'use client' を原則として付与する
✅ 静的な表示のみの場合は Server Component を推奨する
❌ 直接データベースアクセス禁止

### 🔧 src/features/[feature-name]/services/
役割: データアクセス・ビジネスロジック層
実行環境: サーバーサイド専用

ルール:
✅ import 'server-only' 必須
✅ データベースアクセス・外部API呼び出し
✅ ビジネスロジックの実装
❌ React Hooks・DOM操作禁止

### 🎣 src/features/[feature-name]/hooks/
役割: React Hooks・クライアントサイドのロジック
実行環境: クライアントサイド専用

ルール:
✅ 'use client' 必須
✅ React Hooks・状態管理
✅ ブラウザAPI・DOM操作
❌ 直接データベースアクセス禁止

### 📝 src/features/[feature-name]/types/
役割: 機能固有の型定義
実行環境: 共通（環境非依存）

ルール:
✅ 環境非依存の型定義のみ
❌ 実行時コード・関数の実装禁止

### 🛠️ src/features/[feature-name]/utils/
役割: 共通的に使用される関数・ロジックの定義
実行環境: 実装内容により決定

ルール:
✅ 環境非依存：実行環境指定不要
✅ サーバー固有処理：import 'server-only' 必須
✅ クライアント固有処理：`import 'client-only'` を推奨（React を使用するモジュールのみ `'use client'`）
ℹ️ 備考：`'use client'` はモジュール境界を広げ依存をクライアントバンドルへ巻き込みやすいため、非 UI のユーティリティでは避ける


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

## 実行環境の明確化ルール（暫定ガイドライン）

### コンポーネント
- ✅ インタラクティブな要素（クリック、フォーム、useState/useEffect など）を持つ場合は `'use client'` を原則として付与する
- ✅ 静的な表示のみの場合は Server Componentで実装する

### Services
- ✅ サーバーサイド処理は `import 'server-only'` を必須付与
- ✅ Server Actions は `'use server'` を付与
- ℹ️ 備考：クライアント専用処理は Services ではなく utils に配置すること

### Utils
- ✅ 環境非依存：実行環境指定不要
- ✅ サーバー固有処理：`import 'server-only'` 必須
- ✅ クライアント固有処理（ユーティリティ）：`import 'client-only'` 推奨
- ✅ クライアントコンポーネント共存またはReact使用時：`'use client'` を使用

## 📋 チェックリスト
### ファイル作成時:
- 適切なディレクトリに配置しているか
- 実行環境を明示しているか（原則として 'use client' / 'use server' / server-only / client-only を利用する）
- 依存関係が適切か（UIがサービス層経由でデータアクセスしているか）

### コードレビュー時:
- 実行環境の指定が適切
- ディレクトリ配置が規約に従っている
- データフローが推奨パターンに従っている
- 禁止されたAPI使用がない
- 絶対パス（@/）の使用推奨

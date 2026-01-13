# Setup Tools - マルチチーム設定ツール

## 概要

Action Boardをマルチチーム向けにカスタマイズするための対話的セットアップツール。

## クイックスタート

```bash
# setup/ディレクトリに移動
cd setup

# 依存関係をインストール（初回のみ）
npm install

# セットアップ実行
npm run init
```

## 機能

### 1. 対話的セットアップ
- チームID、チーム名の設定
- プライマリカラーからカラーパレット自動生成
- 機能の有効/無効切り替え
- サイトURL、サポートメールの設定

### 2. 自動生成
- チーム設定ファイル（JSONC）
- 環境変数ファイル（.env.local）
- カスタムカラーパレット（HSL形式）

### 3. バリデーション
- JSONスキーマによる設定検証
- 入力値の形式チェック

## ディレクトリ構造

```
setup/
├── README.md               # メインドキュメント
├── SETUP-PHILOSOPHY.md     # 設計思想
├── TEAM-CONFIG.md          # チーム設定リファレンス
├── init-team.ts            # 対話的セットアップスクリプト
├── build-team-css.ts       # CSS生成スクリプト
├── copy-libs.ts            # ライブラリコピースクリプト
├── configs/                # 設定テンプレート
│   ├── base.jsonc
│   ├── teams/
│   ├── themes/
│   └── team-config.schema.json
├── lib/                    # セットアップ用ライブラリ
│   ├── config.ts
│   ├── color-utils.ts
│   ├── generator.ts
│   ├── prompts.ts
│   ├── replacer.ts
│   ├── templates.ts
│   ├── transaction.ts
│   └── validator.ts
├── package.json
└── tsconfig.json
```

## 設計方針

- **独立性**: setup/は独立したパッケージとして動作
- **サンプル実装**: 既存アプリケーションコードは変更なし
- **説明用**: マルチチーム設定システムの実装例を提供

## 関連ドキュメント

- `SETUP-PHILOSOPHY.md` - 設計思想
- `TEAM-CONFIG.md` - 設定リファレンス

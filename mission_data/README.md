# Mission Data Management System

宣言的なYAMLファイルでミッションデータを管理するシステムです。

## セットアップ

```bash
# 依存関係のインストール（プロジェクトルートで実行）
npm install
```

## 使い方

### 1. 現在のDBデータをエクスポート

既存のデータベースからYAMLファイルを生成します：

```bash
npm run mission:export
```

以下のファイルが生成されます：
- `mission_data/categories.yaml` - カテゴリ定義
- `mission_data/missions.yaml` - ミッション定義
- `mission_data/category_links.yaml` - カテゴリとミッションの紐付け

### 2. YAMLファイルを編集

生成されたYAMLファイルを直接編集して、データを更新します。

### 3. データベースに同期

#### ドライラン（変更内容の確認）

```bash
npm run mission:sync:dry
```

#### 実際の同期

```bash
npm run mission:sync
```

#### 特定のデータタイプのみ同期

```bash
# カテゴリのみ
npm run mission:sync -- --only=categories

# ミッションのみ
npm run mission:sync -- --only=missions

# リンクのみ
npm run mission:sync -- --only=links
```

## YAMLファイルの形式

### categories.yaml

```yaml
categories:
  - slug: "learn-about-teammirai"
    title: "チームみらいのことを知ろう"
    sort_no: 100
    category_kbn: "DEFAULT"
```

### missions.yaml

```yaml
missions:
  - slug: "follow-anno-x"
    title: "安野たかひろの公式Xをフォローしよう"
    icon_url: "/img/mission_fallback.svg"
    content: "新党チームみらい党首・..."
    difficulty: 1
    required_artifact_type: "TEXT"
    max_achievement_count: 1
    is_featured: false
    is_hidden: false
    artifact_label: "あなたのXアカウント名"
    ogp_image_url: "https://..."
```

### category_links.yaml

```yaml
category_links:
  - category_slug: "follow-teammirai"
    missions:
      - mission_slug: "follow-anno-x"
        sort_no: 350
      - mission_slug: "follow-teammirai-x"
        sort_no: 300
```

## 注意事項

- slugは一意である必要があります
- 同期時は既存のデータを上書きします（UPSERT）
- category_linksの同期時は、既存のリンクをすべて削除してから再作成します
- 環境変数（.env）は自動的にプロジェクトルートから読み込まれます
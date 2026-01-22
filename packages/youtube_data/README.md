# @action-board/youtube-data

YouTube Data API を使用して `#チームみらい` ハッシュタグの動画を取得・管理するパッケージ。

## セットアップ

### 環境変数

```bash
YOUTUBE_API_KEY=your-youtube-api-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### YouTube API キーの取得

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. YouTube Data API v3 を有効化
3. 認証情報 → API キーを作成

## 使い方

### 通常の日次同期

新しい動画を取得し、既存動画の統計情報を更新。

```bash
pnpm --filter @action-board/youtube-data sync
```

### バックフィル（過去の動画を取得）

DBに保存済みの最古の動画より前の動画を取得。

```bash
pnpm --filter @action-board/youtube-data sync --backfill --max-results 500
```

### ドライラン

実際には保存せず、取得される動画を確認。

```bash
pnpm --filter @action-board/youtube-data sync --dry-run
pnpm --filter @action-board/youtube-data sync --backfill --max-results 500 --dry-run
```

## CLI オプション

| オプション | 説明 |
|-----------|------|
| `--dry-run` | 実際には保存せず確認のみ |
| `--backfill` | 過去の動画を取得（最古より前を検索） |
| `--max-results <n>` | 最大取得件数（デフォルト: 50） |

## データベーススキーマ

### youtube_videos（動画マスターデータ）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 主キー |
| video_id | VARCHAR | YouTube動画ID |
| video_url | VARCHAR | 動画URL |
| title | VARCHAR | タイトル |
| description | TEXT | 説明文 |
| thumbnail_url | VARCHAR | サムネイルURL |
| channel_id | VARCHAR | チャンネルID |
| channel_title | VARCHAR | チャンネル名 |
| published_at | TIMESTAMPTZ | 公開日時 |
| duration | VARCHAR | 再生時間（ISO 8601形式: PT1H2M3S） |
| tags | TEXT[] | タグ配列 |
| is_active | BOOLEAN | アクティブフラグ |

### youtube_video_stats（日毎の統計スナップショット）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 主キー |
| youtube_video_id | UUID | youtube_videos.id への外部キー |
| recorded_at | DATE | 記録日 |
| view_count | BIGINT | 視聴回数 |
| like_count | BIGINT | いいね数 |
| comment_count | BIGINT | コメント数 |

## API ユニット消費

YouTube Data API の日次クォータは 10,000 ユニット。

| API | ユニット/リクエスト | 備考 |
|-----|-------------------|------|
| Search API | 100 | 最大50件/リクエスト |
| Videos API | 1 | 最大50件/リクエスト |

### 消費量の目安

- 通常同期（新規0件、既存100件）: 100 + 2 = **102ユニット**
- バックフィル（500件）: 1000 + 10 = **1010ユニット**

## GitHub Actions

毎日 JST 23:00 に自動実行。

```yaml
# .github/workflows/sync-youtube-videos-production.yml
on:
  schedule:
    - cron: "0 14 * * *"  # UTC 14:00 = JST 23:00
```

## duration の形式

ISO 8601 duration 形式で保存されます。

| 表記 | 意味 |
|------|------|
| `PT17M27S` | 17分27秒 |
| `PT1H2M3S` | 1時間2分3秒 |
| `P0D` | ライブ配信中（終了後に更新される） |

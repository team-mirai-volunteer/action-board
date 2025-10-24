# Poster Boards 関連スキーマ概要

本ドキュメントは、ポスター掲示板（poster_board）に関係する Supabase パブリックスキーマのテーブル構成・リレーションをまとめたものです。随時更新される Enum や RPC も含め、データモデリングの全体像を把握できるようにしています。

## Enum 定義

### poster_board_status

| 値 | 意味 | 備考 |
| --- | --- | --- |
| `not_yet` | 未着手 | 初期ステータス。 |
| `reserved` | 掲載予約済み | 掲示予定が決まっている状態。 |
| `done` | 掲載完了 | 旧 `posted` / `checked` を統合。 |
| `error_wrong_place` | エラー：場所違い | 位置が誤っている場合。 |
| `error_damaged` | エラー：破損 | 掲示板の破損を検知。 |
| `error_wrong_poster` | エラー：別ポスター | 想定外のポスターが貼られている場合。 |
| `not_yet_dangerous` | 未着手（危険） | 2025-07-14 追加の警戒用ステータス。 |
| `other` | その他 | 分類不能な状態。 |

### poster_prefecture_enum
対象 12 都道府県（北海道〜福岡県）を日本語で保持。`poster_boards`・`poster_board_totals`・`poster_activities`・`staging_poster_boards` などで参照されます。

## テーブル定義

### poster_boards
ポスター掲示板のマスターデータ。CSV 由来のメタ情報と最新状況を保持します。

| カラム | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| `id` | uuid | No | `gen_random_uuid()` | 主キー。 |
| `prefecture` | `poster_prefecture_enum` | No |  | 対象都道府県。 |
| `city` | text | No |  | 市区町村名。 |
| `number` | text | Yes |  | 掲示板番号（任意）。 |
| `name` | text | Yes |  | 掲示板名称。空文字可。 |
| `address` | text | Yes |  | 詳細住所。空文字可。 |
| `lat` | numeric(10,8) | Yes |  | 緯度。NULL 可、`chk_lat` で範囲チェック。 |
| `long` | numeric(11,8) | Yes |  | 経度。NULL 可、`chk_long` で範囲チェック。 |
| `status` | `poster_board_status` | No | `'not_yet'` | 掲示板の状態。 |
| `row_number` | integer | Yes |  | 元 CSV の行番号。 |
| `file_name` | text | Yes |  | 取り込み元ファイル名。 |
| `created_at` | timestamptz | No | `timezone('utc', now())` | 生成日時。 |
| `updated_at` | timestamptz | No | `timezone('utc', now())` | 更新日時。`update_poster_boards_updated_at` トリガで自動更新。 |

**制約 / インデックス**
- 一意制約 `poster_boards_row_file_prefecture_unique (row_number, file_name, prefecture)`：同一ファイル内での重複行を防止（2025-07-04 追加）。
- `chk_lat`, `chk_long` により緯度経度の範囲を保証。
- インデックス：`idx_poster_boards_lat_long`, `idx_poster_boards_prefecture`, `idx_poster_boards_status`。

**RLS ポリシー**
- `poster_boards_public_select`：`anon`/`authenticated` ロールに読み取りを許可。
- `poster_boards_update_policy`：認証済みユーザーのみ更新可（挿入・削除はサービスロール想定）。

### poster_board_status_history
掲示板ステータスの変更履歴。更新ユーザーとメモを追跡します。

| カラム | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| `id` | uuid | No | `gen_random_uuid()` | 主キー。 |
| `board_id` | uuid | No |  | `poster_boards.id` への FK（ON DELETE CASCADE）。 |
| `user_id` | uuid | No |  | `auth.users.id` への FK（ON DELETE CASCADE）。 |
| `previous_status` | `poster_board_status` | Yes |  | 更新前ステータス。 |
| `new_status` | `poster_board_status` | No |  | 更新後ステータス。 |
| `note` | text | Yes |  | 任意メモ。 |
| `created_at` | timestamptz | No | `timezone('utc', now())` | 履歴追加日時。 |

**制約 / インデックス**
- インデックス：`idx_poster_board_status_history_board_id`, `idx_poster_board_status_history_user_id`, `idx_poster_board_status_history_board_created`, `idx_poster_board_status_history_user_created`。

**RLS ポリシー**
- `poster_board_status_history_select_policy`：認証済みユーザーのみ読取可能。
- `poster_board_status_history_insert_policy`：`auth.uid() = user_id` のときのみ挿入可。更新・削除はサービスロール想定。

### poster_activities
ユーザーが実行した掲示板活動ログ。掲示板とミッション成果物に紐づきます。

| カラム | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| `id` | uuid | No | `gen_random_uuid()` | 主キー。 |
| `user_id` | uuid | No |  | `auth.users.id`（ON DELETE CASCADE）。 |
| `mission_artifact_id` | uuid | No |  | `mission_artifacts.id`（ON DELETE CASCADE）。 |
| `board_id` | uuid | Yes |  | `poster_boards.id`（ON DELETE CASCADE）。任意で掲示板に紐付け。 |
| `poster_count` | integer | No |  | 掲示した枚数。`CHECK (poster_count > 0)`。 |
| `prefecture` | `poster_prefecture_enum` | No |  | 活動場所の都道府県。 |
| `city` | text | No |  | 市区町村（100 文字以内）。 |
| `number` | text | No |  | 掲示板番号（20 文字以内）。 |
| `name` | text | Yes |  | 任意名称（100 文字以内）。 |
| `note` | text | Yes |  | メモ（200 文字以内）。 |
| `address` | text | Yes |  | 詳細住所（200 文字以内）。 |
| `lat` | numeric(10,8) | Yes |  | 緯度。 |
| `long` | numeric(11,8) | Yes |  | 経度。 |
| `created_at` | timestamptz | No | `now()` | 作成日時。 |
| `updated_at` | timestamptz | No | `now()` | 更新日時。 |

**制約 / インデックス**
- 外部キー `poster_activities_board_id_fkey`（ON DELETE CASCADE）。
- インデックス：`idx_poster_activities_user_id`, `idx_poster_activities_mission_artifact_id`, `idx_poster_activities_created_at`, `idx_poster_activities_prefecture`, `idx_poster_activities_city`, `idx_poster_activities_board_id`。

**RLS ポリシー**
- `Users can manage their own poster activities`：本人のみ全操作可。

### poster_board_totals
選挙管理委員会などから提供される公式設置数を保存。

| カラム | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| `id` | uuid | No | `gen_random_uuid()` | 主キー。 |
| `prefecture` | `poster_prefecture_enum` | No |  | 対象都道府県。 |
| `city` | text | Yes |  | 市区町村別内訳（任意）。 |
| `total_count` | integer | No |  | 掲示板総数。`CHECK (total_count > 0)`。 |
| `source` | text | Yes |  | 参照元（選管名など）。 |
| `note` | text | Yes |  | 備考。 |
| `updated_at` | timestamptz | Yes | `now()` | 更新日時。`update_poster_board_totals_updated_at` トリガで自動更新。 |
| `created_at` | timestamptz | Yes | `now()` | 作成日時。 |

**制約 / インデックス**
- `UNIQUE(prefecture, city)`。
- インデックス：`idx_poster_board_totals_prefecture`, `idx_poster_board_totals_prefecture_city`。

**RLS ポリシー**
- 読み取り：`Allow public read access to poster_board_totals`（すべてのロール）。
- 書き込み：`Allow service role to manage poster_board_totals`（service_role のみ）。

### staging_poster_boards
CSV 取込用のステージングテーブル。本番マスタとほぼ同一カラムを持つが主キー制約なし。RLS は無効化されたまま（サービスロール専用）。

| 主な特性 |
| --- |
| `id` は `uuid` デフォルト付きだが PK ではない（NULL 許容）。 |
| `prefecture`, `city`, `status` は NOT NULL。その他のカラムは `poster_boards` と同様に NULL/空文字を許容。 |
| `row_number`, `file_name` カラムも保持しており、インポート元のメタ情報を記録。 |

## ビュー

### poster_board_latest_editors
`poster_boards` と `poster_board_status_history` を結合し、掲示板ごとの最新更新者情報を保持するビュー。

| カラム | 説明 |
| --- | --- |
| `board_id` | 対象掲示板 ID。 |
| `prefecture`, `lat`, `long`, `status` | 元の掲示板属性。 |
| `last_editor_id` | 直近でステータスを更新したユーザー。 |
| `last_edited_at` | その更新日時。 |
| `new_status`, `previous_status` | 最新履歴の状態遷移。 |

ビューには `authenticated`・`anon` ロールへ SELECT 権限が付与されています。

## RPC / 関数
- `update_updated_at_column()`：`poster_boards` と `poster_board_totals` で `updated_at` を自動更新するトリガー関数。
- `get_poster_board_stats()`：都道府県×ステータス別件数を返却。座標が NULL の行は除外（2025-07-15 更新）。
- `get_poster_board_stats_optimized(target_prefecture)`：指定都道府県の総数とステータス別件数を JSON で返却。座標 NULL を除外。
- `get_user_edited_boards_by_prefecture(target_prefecture, target_user_id)`：指定ユーザーが最後に編集した掲示板 ID を返却。
- `get_user_edited_boards_with_details(...)`：上記の詳細版（座標・最新ステータスを含む）。

## リレーションまとめ
- `poster_boards.id` ↔ `poster_board_status_history.board_id`（1:N、CASCADE）。
- `poster_boards.id` ↔ `poster_activities.board_id`（1:N、CASCADE、NULL 可）。
- `auth.users.id` ↔ `poster_board_status_history.user_id` / `poster_activities.user_id`（1:N、CASCADE）。
- `mission_artifacts.id` ↔ `poster_activities.mission_artifact_id`（1:N、CASCADE）。
- `poster_board_latest_editors` は `poster_board_status_history` の最新行を掲示板単位で射影したビュー。
- `poster_board_totals` は FK を持たないが、`prefecture` 列で掲示板データと紐付けて集計用途に利用。
- `staging_poster_boards` はサービスロールが `poster_boards` にマージするための中間テーブル。

## 運用メモ
- スキーマ更新後は `npm run types` で Supabase 型定義 (`lib/types/supabase.ts`) を再生成すること。
- 掲示板のステータスが追加された場合は、RPC・アプリ側のステータス集計ロジック（特に `get_poster_board_stats_optimized`）が新しい値を扱えるか確認する。
- CSV 取込フローでは `staging_poster_boards` → 重複判定（`row_number`, `file_name`, `prefecture`）→ 本テーブル反映という順序を想定。

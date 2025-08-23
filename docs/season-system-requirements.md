# シーズン制度 要件定義書

## 1. 概要

### 1.1 背景
現在のシステムでは、ユーザーのポイントやレベルが累積されていくため、新規参加者が既存のアクティブユーザーに追いつくことが困難である。この問題を解決するため、定期的にリセットされるシーズン制度を導入する。

### 1.2 目的
- 新規参加者にも上位ランキングを目指すチャンスを提供する
- 各選挙/シーズンごとの個人の貢献を明確に可視化する
- ゲーミフィケーション要素を強化し、ユーザーのモチベーションを維持する

## 2. 機能要件

### 2.1 シーズン管理

#### 2.1.1 シーズンの定義
- シーズンは可変期間（選挙期間などに合わせて設定）
- 各シーズンには以下の属性を持つ：
  - シーズンID (UUID)
  - シーズンslug（例：`2025summer`）- URL用の識別子
  - シーズン名（例：「2025年夏シーズン」）
  - 開始日時
  - 終了日時
  - is_active（現在のシーズンかどうか）

#### 2.1.2 シーズンの切り替え
- 手動でシーズンを切り替える
- 移行時の処理：
  1. 現在シーズンのis_activeをfalseに更新
  2. 新シーズンのレコードをis_active=trueで作成

### 2.2 データ管理

#### 2.2.1 シーズンごとのデータ分離
- 各データテーブルにseason_idを追加し、シーズンごとにデータを分離
- 影響を受けるテーブル：
  - xp_transactions
  - user_levels
  - achievements
  - user_badges

#### 2.2.2 ランキング
- リアルタイム計算でランキングを表示
- シーズンごとにフィルタリングして計算

### 2.3 UI/UX要件

#### 2.3.1 URL構造
- 現在シーズン：既存のURLパスを維持
  - `/ranking`
  - `/users/[id]`
- 過去シーズン：シーズンslugを含むパス
  - `/seasons/[slug]/ranking`
  - `/seasons/[slug]/users/[id]`

#### 2.3.2 ユーザープロフィールページ
- 現在シーズンの成績を表示
- 過去シーズンページ（`/seasons/[slug]/users/[id]`）では該当シーズンの成績を表示
- 表示内容：
  - ポイント、レベル、ランキング順位
  - 獲得バッジ一覧
  - ミッション達成状況

#### 2.3.3 ランキングページ
- 現在シーズンのランキングを表示（`/ranking`）
- 過去シーズンランキングページ（`/seasons/[slug]/ranking`）
- ランキング種別（通常/ミッション別/都道府県別）は維持

#### 2.3.4 フッター
- 現在のシーズン名を表示
- 全シーズンの一覧を表示（シーズン名のみ）
  - 各シーズン名をクリックすると `/seasons/[slug]/ranking` へ遷移

## 3. データベース設計

### 3.1 新規テーブル

#### 3.1.1 seasons テーブル
```sql
- id: UUID (PK)
- slug: VARCHAR(50) UNIQUE -- URLで使用する識別子
- name: VARCHAR(255)
- start_date: TIMESTAMP
- end_date: TIMESTAMP
- is_active: BOOLEAN DEFAULT false
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```


### 3.2 既存テーブルの修正

#### 3.2.1 xp_transactions テーブル
```sql
- season_id: UUID (FK) -- 追加
- INDEX: (user_id, season_id)
```

#### 3.2.2 user_levels テーブル
```sql
- season_id: UUID (FK) -- 追加
- UNIQUE KEY: (user_id, season_id) -- 複合ユニーク制約
```

#### 3.2.3 achievements テーブル
```sql
- season_id: UUID (FK) -- 追加
- INDEX: (user_id, season_id)
```

#### 3.2.4 user_badges テーブル
```sql
- season_id: UUID (FK) -- 追加
- INDEX: (user_id, season_id)
```

## 4. データ取得方法

### 4.1 シーズンデータの取得
- 現在シーズン：`supabaseClient.from('seasons').select().eq('is_active', true).single()`
- シーズン一覧：`supabaseClient.from('seasons').select()`
- 特定シーズン：`supabaseClient.from('seasons').select().eq('slug', slug).single()`

### 4.2 ランキング関数の更新

既存のランキング関数にseason_idパラメータを追加：
- get_ranking(season_id UUID)
- get_mission_ranking(season_id UUID, mission_id UUID)
- get_prefecture_ranking(season_id UUID, prefecture TEXT)

## 5. 実装上の考慮事項

### 5.1 データ移行
- 既存データを「シーズン1」として移行
  - slug: `season1`
  - name: 「シーズン1」
  - start_date: サービス開始日
  - end_date: 新シーズン開始日の前日
- 移行スクリプトの作成
- ダウンタイムなしでの移行を目指す

### 5.2 シーズン切り替え
- 管理者が手動でSQLを実行してシーズンを切り替える
- 切り替えスクリプトの作成

### 5.3 パフォーマンス最適化
- season_idを含むインデックスの追加
- 現在シーズンのデータのみを扱うビューの作成

### 5.4 RLS（Row Level Security）の更新
- season_idを考慮したポリシーの更新
- ユーザーは全シーズンのデータを閲覧可能
- 書き込みは現在シーズンのみ

## 6. テスト計画

### 6.1 ユニットテスト
- シーズン切り替えロジック
- ランキング計算（シーズン別）
- データ移行スクリプト

### 6.2 E2Eテスト
- シーズン切り替え時の動作
- 過去シーズンデータの表示
- URLルーティング

### 6.3 パフォーマンステスト
- 大量データでのランキング表示速度
- シーズン切り替え時の処理時間

## 7. 今後の拡張可能性

### 7.1 シーズン報酬
- シーズン終了時の順位に応じた特別バッジ
- シーズン限定ミッション

### 7.2 シーズン比較機能
- 複数シーズンの成績比較
- 成長推移グラフ

### 7.3 シーズンイベント
- 期間限定のダブルXPイベント
- シーズン終盤のランキング競争イベント

## 8. 実装スケジュール

### フェーズ1：基盤実装（2週間）
- データベース設計・マイグレーション作成
- 既存データの「シーズン1」への移行
- 基本的なAPI実装

### フェーズ2：UI実装（2週間）
- 過去シーズンページ（/seasons/[slug]/...）
- フッターへのシーズン一覧表示

### フェーズ3：最適化・テスト（1週間）
- パフォーマンス最適化
- テスト実装

### フェーズ4：リリース準備（1週間）
- 本番データ移行準備
- ドキュメント整備
- 段階的リリース計画
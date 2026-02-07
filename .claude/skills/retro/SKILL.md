---
name: retro
description: PRコメントやセッション発見を分析し、CLAUDE.md・skills・agents・memoryに学びを自動反映する振り返りスキル。セッション終了時やPRレビュー後に使う。
---

# Retro（振り返り・自動学習）

PRレビューのフィードバックやセッション中に得た知見を分析し、プロジェクト設定ファイルに自動反映するスキル。

## 引数

$ARGUMENTS

- PR番号（例: `2088`）→ 指定PRのレビューコメントを分析
- PR番号リスト（例: `2084 2085 2088`）→ 複数PR分析
- `recent` → 直近のマージ済みPRコメントを分析
- `session` → 今セッションの発見を分析・反映
- 引数なし → stagingファイルの未処理学びを処理

## ワークフロー

### Phase 1: 学びの収集

#### パターンA: PRレビュー分析（PR番号指定時）

以下のコマンドでPRコメントを取得する:

```bash
# CodeRabbit・人間レビュアーのインラインコメント（botを除外）
# 注意: jqで != を使うとBashツールが \! にエスケープするため、代替構文を使用
gh api repos/team-mirai-volunteer/action-board/pulls/{PR}/comments \
  --jq '[.[] | select(.user.login | test("vercel|codecov") | not) | {user: .user.login, path: .path, body: .body}]'

# レビューサマリー
gh api repos/team-mirai-volunteer/action-board/pulls/{PR}/reviews \
  --jq '[.[] | select(.body | length > 0) | {user: .user.login, state: .state, body: .body}]'
```

`recent` の場合:
```bash
# 直近マージ済みPRを取得
gh pr list --state merged --limit 10 --json number,title,mergedAt
```

各コメントから以下を抽出する:
1. **事象**: 何が問題だったか
2. **原因**: なぜ問題か（フレームワーク制約、設計原則等）
3. **対処**: どう解決したか（または解決策の提案）
4. **ルール化候補**: 今後のルール案

CodeRabbitコメントのフィルタリング:
- `_⚠️ Potential issue_` + `_🔴 Critical_` or `_🟠 Major_` → 必ず分析
- `_🟡 Minor_` → 内容を見て判断
- `nitpick` → スキップ
- botのboilerplate（analysis chain、prompt for AI agents等）→ スキップし本文のみ分析

#### パターンB: セッション振り返り（`session` 指定時）

1. MEMORY.mdの現在の内容を読む
2. stagingファイル（`.claude/tmp/learnings-staging.md`）があれば読む
3. 会話のコンテキストから、このセッションで遭遇した問題や発見を整理する

#### パターンC: stagingファイル処理（引数なし時）

`.claude/tmp/learnings-staging.md` の内容を読み込み、未処理の学びを抽出する。

### Phase 2: 学びの分類

各学びを以下の判定ツリーで分類する:

```
この学びは...
├─ 全セッションで常に意識すべき普遍ルールか？
│  ├─ Yes → 既にCLAUDE.mdに類似ルールがあるか？
│  │  ├─ Yes → CLAUDE.md既存セクションに追記/補強
│  │  └─ No → CLAUDE.mdに新規ルール追加
│  └─ No
│     ├─ 特定のワークフロー（PR作成、テスト等）の改善か？
│     │  └─ Yes → 対応する skill/command を更新
│     ├─ ワーカーエージェントの行動指針か？
│     │  └─ Yes → agents/worktree-worker.md に追記
│     ├─ 再現性のある操作知識・ワークアラウンドか？
│     │  └─ Yes → MEMORY.md に追記
│     └─ 一過性の事象 → 記録不要
```

#### 分類の具体基準

**CLAUDE.md（全セッション適用の普遍ルール）**:
- フレームワーク制約（Next.js、React、Supabase等の技術的制約）
- ファイル配置ルール（どのファイルをどこに置くか）
- インポートルール（何から何をインポートしてよいか）
- データアクセスパターン
- セキュリティ・認可ルール

**Skill/Command（特定ワークフローの改善）**:
- PR作成時の新しいチェック項目
- テスト実行時の注意事項
- CI失敗時の新しい対処パターン
- 並列PR作成の改善点

**Agent（ワーカーの行動指針）**:
- コード品質チェックの追加項目
- ブランチ操作の注意事項
- ファイル生成時の新しいパターン

**MEMORY.md（運用知識）**:
- 特定のバグやflakyテストの情報
- 作業履歴・実績データ
- 環境固有の問題と回避策

### Phase 3: 自動適用

分類に基づいて、対象ファイルを直接更新する。承認は不要（全自動）。

#### CLAUDE.md更新ルール

1. 現在のCLAUDE.mdを読み込み、セクション構造を把握する
2. 学びが属するセクションを特定する
3. **既存の内容は削除・変更しない（追記のみ）**
4. 既存セクションに関連するなら箇条書きで追記
5. 新しいカテゴリなら適切な位置に新セクション追加
6. コード例がある場合は「正しいパターン」「禁止パターン」の形式にする
7. 追加前にGrepで既に類似の記述がないか確認（重複防止）

#### MEMORY.md更新ルール

1. 200行制限を意識（現在の行数を確認してから追記）
2. 150行を超えたら詳細を別ファイル（memory/配下）に分離
3. 既存セクションのスタイル（`## 見出し` + 箇条書き）に統一

#### Skills/Agents更新ルール

1. YAMLフロントマター（name, description）は変更しない
2. `## 注意事項` セクションへの箇条書き追記が基本
3. ワークフロー手順にチェック項目を追加する場合もあり

### Phase 4: 結果報告

以下の形式でユーザーに報告する:

```
## 振り返り結果

### 適用した学び: N件

| # | 学び | 分類 | 適用先 |
|---|------|------|--------|
| 1 | ... | ルール | CLAUDE.md |
| 2 | ... | 運用知識 | MEMORY.md |

### 変更したファイル
- CLAUDE.md: 「XXX」セクションに追記
- MEMORY.md: 「YYY」セクションに追記

### スキップした指摘（一過性 or 既に記録済み）
- ...
```

### Phase 5: stagingファイルのクリア

処理済みの学びを `.claude/tmp/learnings-staging.md` から削除する（ファイル自体は残す）。

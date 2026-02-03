---
description: "現在のブランチからPRを作成する"
---

## 引数

$ARGUMENTS

## タスク

現在のブランチから develop ブランチに対してPRを作成します。

### 1. 事前確認とrebase

以下のコマンドを実行して最新のdevelopにrebase：

```bash
# 最新のdevelopをfetch
git fetch origin develop

# 現在のブランチ名
git branch --show-current

# ワーキングツリーの状態
git status

# 最新のdevelopにrebase
git rebase origin/develop
```

### 2. 差分の確認

rebase後、origin/develop との差分を確認：

```bash
# コミット一覧
git log origin/develop..HEAD --oneline

# 変更ファイルの統計
git diff origin/develop...HEAD --stat
```

### 3. ユーザーへの確認

差分の内容（コミット数、変更ファイル数）をユーザーに報告し、`AskUserQuestion` で次のアクションを確認：

```
質問: "PRを作成しますか？"
選択肢:
- PR作成 (推奨)
- キャンセル
```

### 4. PR作成

#### 4.1 リモートにpush

リモートブランチの存在を確認し、適切なpushコマンドを実行：

```bash
# リモートブランチが存在すればforce-with-lease、なければ通常push
git ls-remote --heads origin <ブランチ名> | grep -q <ブランチ名> && \
  git push origin <ブランチ名> --force-with-lease || \
  git push -u origin <ブランチ名>
```

#### 4.2 PRタイトルと本文の生成

まず `.github/PULL_REQUEST_TEMPLATE.md` を読み込み、テンプレートに従ってPR本文を生成する。

コミットメッセージを分析し、以下のルールでPRを作成：

- **タイトル**: コミットが1つの場合はそのメッセージを使用、複数の場合は変更内容を要約（70文字以内）
- **本文**: PRテンプレートの形式に従い、各セクションを埋める
  - `# 変更の概要`: 変更内容を箇条書きで記載
  - `# 変更の背景`: 変更理由と関連Issue（あれば `closes #<issue番号>`）
  - `# スクリーンショット`: フロントエンドの変更がない場合はチェックを入れる
  - `# CLAへの同意`: チェックを入れない（ユーザーが確認して入れる）

#### 4.3 gh pr create の実行

`.github/PULL_REQUEST_TEMPLATE.md` を読み込み、各セクションを適切に埋めてPRを作成する。

- フロントエンド変更がない場合はスクショのチェックを入れる
- CLAのチェックはユーザーに任せる（チェックを入れない）

```bash
gh pr create --base develop --title "<タイトル>" --body "$(cat <<'EOF'
<テンプレートに従った本文>
EOF
)"
```

### 5. 完了報告

PRのURLを表示：

```
✅ PR作成完了: <PR URL>
```

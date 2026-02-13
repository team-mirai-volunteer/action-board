---
description: "現在のブランチからPRを作成する"
---

## 引数

$ARGUMENTS

## タスク

現在の変更から新しいブランチを作成し、develop ブランチに対してPRを作成します。

### 0. リモート環境の検出

フォーク環境か通常環境かを検出し、適切なリモートとリポジトリを設定：

```bash
# upstreamリモートの存在確認
if git remote get-url upstream >/dev/null 2>&1; then
  # フォーク環境: upstreamを使用
  TARGET_REMOTE="upstream"
  TARGET_REPO=$(git remote get-url upstream | sed -E 's#.*github.com[:/](.+/.+)\.git$#\1#' | sed 's/\.git$//')
  echo "✓ フォーク環境を検出: ${TARGET_REPO} を使用"
else
  # 通常環境: originを使用
  TARGET_REMOTE="origin"
  TARGET_REPO=$(git remote get-url origin | sed -E 's#.*github.com[:/](.+/.+)\.git$#\1#' | sed 's/\.git$//')
  echo "✓ 通常環境: ${TARGET_REPO} を使用"
fi
```

### 0.1 リモート接続の確認

設定されたリモートに到達可能か確認：

```bash
# リモートの接続確認
if ! git ls-remote --exit-code ${TARGET_REMOTE} >/dev/null 2>&1; then
  echo "❌ エラー: ${TARGET_REMOTE} リモートに接続できません"
  echo "リモートURL: $(git remote get-url ${TARGET_REMOTE})"
  echo ""
  echo "以下を確認してください："
  echo "1. ネットワーク接続"
  echo "2. リモートURLの正確性"
  echo "3. リポジトリへのアクセス権限"
  exit 1
fi
echo "✓ ${TARGET_REMOTE} リモートへの接続確認完了"
```

### 1. 事前確認

```bash
# 最新のdevelopをfetch
git fetch ${TARGET_REMOTE} develop

# 現在のブランチ名とワーキングツリーの状態を確認
git branch --show-current
git status

# ${TARGET_REMOTE}/developとの差分コミットを確認
git log ${TARGET_REMOTE}/develop..HEAD --oneline
```

### 1.1 マージ済みブランチの扱い（Squash運用）

このリポジトリは **Squashマージ運用** のため、マージ済みブランチの使い回しは行わない。
次の作業は **必ず最新の develop から新規ブランチを作成** する。

現在のブランチに新しい変更がある場合は、以下で新規ブランチへ移す：

```bash
# 未コミットの変更がある場合（stash禁止のため一時コミットで移す）
git add -A
git commit -m "wip: temporary"
git checkout develop
git pull --rebase ${TARGET_REMOTE} develop
git checkout -b <新しいブランチ名>
git cherry-pick <wipコミット>

# すでにコミットがある場合
git checkout develop
git pull --rebase ${TARGET_REMOTE} develop
git checkout -b <新しいブランチ名>
git cherry-pick <コミット範囲>
```

### 2. 新しいブランチの作成（必要な場合）

現在のブランチが `develop` または `main` の場合のみ、新しいブランチを作成：

差分コミットの内容を分析し、適切なブランチ名を生成する：
- `fix/xxx` - バグ修正
- `feat/xxx` - 新機能
- `chore/xxx` - メンテナンス・設定変更

```bash
# 新しいブランチを作成して切り替え（現在のコミットを引き継ぐ）
git checkout -b <新しいブランチ名>
```

既にfeatureブランチにいる場合はブランチ作成をスキップ。

> 重要: `develop` / `main` 上でコミットしないこと。
> 未コミットの変更がある場合は **ブランチ作成を先に行う**。

もし `develop` / `main` で **未コミットの変更が無い** 場合は、先に最新化してからブランチを作成する：

```bash
git pull --rebase ${TARGET_REMOTE} <develop または main>
git checkout -b <新しいブランチ名>
```

### 3. 未コミットの変更をコミット

`git status` で未コミットの変更（staged/unstaged）がある場合は、不要な変更を除外したうえでコミットする：

```bash
# 不要な変更がある場合は取り消す（例）
git restore <ファイル>

# 未追跡ファイルが不要なら削除（必要な場合のみ）
git clean -fd

# 変更をステージング（全変更）
git add -A

# 変更を部分的にステージングしたい場合
git add -p

# コミット（変更内容に応じたメッセージ）
git commit -m "<コミットメッセージ>"
```

コミット前に、意図しないファイルが含まれていないか確認する：

```bash
git status
git diff --stat
```

### 4. 最新のdevelopにrebase

```bash
git rebase ${TARGET_REMOTE}/develop
```

### 5. 差分の確認

${TARGET_REMOTE}/develop との差分を確認：

```bash
# コミット一覧
git log ${TARGET_REMOTE}/develop..HEAD --oneline

# 変更ファイルの統計
git diff ${TARGET_REMOTE}/develop...HEAD --stat
```

差分コミットが 0 件の場合は PR 作成を中止する。

### 6. PR作成

#### 6.1 リモートにpush

リモートブランチの存在を確認し、適切なpushコマンドを実行：

```bash
# リモートブランチが存在すればforce-with-lease、なければ通常push
git ls-remote --heads origin <ブランチ名> | grep -q <ブランチ名> && \
  git push origin <ブランチ名> --force-with-lease || \
  git push -u origin <ブランチ名>
```

#### 6.2 PRタイトルと本文の生成

まず `.github/PULL_REQUEST_TEMPLATE.md` を読み込み、テンプレートに従ってPR本文を生成する。

コミットメッセージを分析し、以下のルールでPRを作成：

- **タイトル**: コミットが1つの場合はそのメッセージを使用、複数の場合は変更内容を要約（70文字以内）
- **本文**: PRテンプレートの形式に従い、各セクションを埋める
  - `# 変更の概要`: 変更内容を箇条書きで記載
  - `# 変更の背景`: 変更理由と関連Issue（あれば `closes #<issue番号>`）
  - `# スクリーンショット`: フロントエンドの変更がない場合はチェックを入れる
  - `# CLAへの同意`: チェックを入れない（ユーザーが確認して入れる）

#### 6.3 gh pr create の実行

`.github/PULL_REQUEST_TEMPLATE.md` を読み込み、各セクションを適切に埋めてPRを作成する。

- フロントエンド変更がない場合はスクショのチェックを入れる
- CLAのチェックはユーザーに任せる（チェックを入れない）

```bash
# リポジトリ指定オプションを動的に設定
if [ "${TARGET_REMOTE}" = "upstream" ]; then
  REPO_OPTION="--repo ${TARGET_REPO}"
else
  REPO_OPTION=""
fi

gh pr create ${REPO_OPTION} --base develop --title "<タイトル>" --body "$(cat <<'EOF'
<テンプレートに従った本文>
EOF
)"
```

### 7. PR差分の検証

PR作成後、意図した変更のみが含まれているか必ず確認する：

```bash
# PRの差分ファイル一覧を取得
gh pr diff <PR番号> --name-only
```

- 今回の作業で変更したファイル以外が含まれていないか確認する
- 余分な変更がある場合は、ブランチの起点が `develop` でない可能性が高い
  - `git rebase --onto develop <元のブランチ> <現在のブランチ>` で修正し、force push する
- 問題がなければ次のステップへ進む

### 8. 完了報告

PRのURLを表示：

```
✅ PR作成完了
Repository: ${TARGET_REPO}
PR URL: <PR URL>
```

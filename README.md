[![Check code with Biome](https://github.com/team-mirai/action-board/actions/workflows/check_biome.yaml/badge.svg)](https://github.com/team-mirai/action-board/actions/workflows/check_biome.yaml)
[![Build & Test E2E/RLS](https://github.com/team-mirai/action-board/actions/workflows/build_test.yaml/badge.svg)](https://github.com/team-mirai/action-board/actions/workflows/build_test.yaml)

# アクションボード

## コントリビュートについて

* プロジェクトへのコントリビュートの際には、[コントリビューターライセンス契約（CLA）](./CLA.md)への同意が必須となります。ご了承ください。

- Issue はどなたでも起票いただけます。ツール利用時に感じた改善点やバグについてぜひ Issue を作成してください
- Issue への自己アサイン（担当者設定）は、Issue コメントに以下のコマンドを記載することで行えます：
  - `/assign` - 自分自身を Issue のアサインに追加
  - `/unassign` - 自分自身を Issue のアサインから削除
- 初めての貢献に適したタスクには`good first issue`ラベルが付いています

## 必要な環境

- Node.js
- Docker
- Supabase CLI

### インストール for Mac

   - Node.jsのインストール `brew install node`
   - Dockerのインストール ([公式サイト](https://docs.docker.jp/desktop/install/mac-install.html))
   - Supabase CLI `brew install supabase/tap/supabase`

### インストール for Windows

#### 事前準備

   - PowerShell ver5.1以上 `PowerShell $PSVersionTable` で確認

   - gitのインストール([公式サイト](https://gitforwindows.org/)) `git --version` で確認

   - WSL2のインストール `wsl --version` で確認
      - `cmd wsl --install` または `PowerShell wsl --install`
      - いずれも管理者権限が必要

   - Hyper-Vの有効化
      1. コントロールパネル > プログラムと機能 > Windowsの機能の有効化または無効化 > Windows ハイパーバイザープラットフォーム > チェックが入っているか確認 (デフォルトでは有効化)
      1. 入ってない場合、チェックマークをつける。チェックマークをつけてもHyper-vが有効になっていない場合があるので、以下で確認
      1. PowerShell(管理者権限)でHyper-vが有効になっているか確認 : `bcdedit` > hypervisorlaunchtype を参照 (AutoであればOK)
      1. Offになっている場合、Hyper-vをAuto(有効)に変更 `bcdedit /set hypervisorlaunchtype auto`
      1. Autoに変更したあとPCの再起動が必要です

#### インストール

   - Node.js
      - [公式サイト](https://nodejs.org/ja)からインストーラーをダウンロードし、実行
      - ver22.16.0 (25/06/06時点)
      - npmも同時にインストールされます

   - Docker
      - [公式ドキュメント](https://docs.docker.jp/desktop/install/windows-install.html)を参照

   - Supabase CLI
      - cmd `npm install -g supabase`
         - E404エラーが出てインストールに失敗する場合
            1. Scoop をインストール
            ```
            powershell -Command "Set-ExecutionPolicy RemoteSigned -Scope CurrentUser"
            powershell -Command "Invoke-WebRequest -Uri https://get.scoop.sh -OutFile install.ps1"
            powershell -Command ".\install.ps1"
            ```

            2. Scoop で supabase をインストール
            ```
            scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
            scoop install supabase
            ```

      - インストールされているか確認: `supabase --version`


## サービスの起動方法

1. `.env.local` ファイルの作成
   ```bash
   cp .env.example .env.local
   ```

   `.env.example` ファイルをコピーして `.env.local` を作成します。

2. Supabase のローカル環境を起動

   ```bash
   supabase start
   ````

- Studio URL: http://127.0.0.1:54323 → Supabaseのダッシュボード
- Inbucket URL: http://127.0.0.1:54324 → ローカルのメールが届きます

3. `.env.local` ファイルの、以下の値を更新:

   ```
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321

   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # SentryのDSNを指定します。開発時は空でもかまいません。
   NEXT_PUBLIC_SENTRY_DSN=
   NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
   ```

3. ローカルデータベースの初期化:

   ```bash
   supabase db reset
   ```

  supabase/migrations以下にあるマイグレーションを実行し、supabase/seed.sqlにあるシードデータをローカルデータベースに流し込みみます。

4. 必要なパッケージをインストール:

   ```bash
   npm install
   ```

5. Next.js のローカル開発サーバーを起動:

   ```bash
   npm run dev
   ```

   サービスは [localhost:3000](http://localhost:3000/) でアクセス可能になります。



## 開発ガイドライン

### ブランチ

mainブランチはリリース可能な状態に保ちましょう。
そのため、以下のブランチ利用ルールで開発しましょう。

* 各機能ごとに、developブランチからfeat/xxxブランチを作り、developブランチにマージ
* developで統合テストをしてからmainブランチに反映

### PR作成

権限管理のコストを踏まえて、各自forkしたリポジトリからオリジナルのリポジトリにPRを作成いただく運用としています。

#### ローカルで開発いただくケース

1. 開発対象のリポジトリをご自身のアカウントにforkしてください。
2. forkしたリポジトリのdevelopブランチからfeatureブランチを作成し、開発を行ってください。
3. commitを作成後、pushをする前にオリジナル（fork元）のリポジトリのdevelopブランチに入った変更を取り込み、必要であればコンフリクトを解消してください。
4. コンフリクトを解消後、リモートリポジトリにpushを行ってください。
5. `fork先:feature -> fork元:develop`のPRを作成してください。
6. 開発スレッドにてレビュー依頼をお願いします。

#### slackチャネルでDevinを使用して開発するケース

1. slackチャネル`9_devinと人間の部屋`で過去のやり取りを参考に、Devinに開発を依頼してください。
2. Devinの修正内容に不足がある場合は、slackでのやりとりを継続、もしくはスレッド内(open webapp)のリンクからGUIにてやりとり、修正を継続してください。
3. コンフリクトが発生している場合は解消を依頼してください。
4. 開発スレッドにてレビュー依頼をお願いします。

### migrationファイル追加手順

#### migrationファイル新規作成

下記コマンドで `supabase/migrations/` ディレクトリに `20250612123456_{名前}.sql` という名前の空ファイルが作成されます。このファイルに SQL を記述してください。

```bash
supabase migration new {名前}
```

※ `{名前}` はmigrationの内容を表す英語名（例: `add_mission_join_slack` ）

#### migrationの適用

作成したmigrationファイルがまだ適用されていない場合、下記コマンドでローカルDBに反映できます。

```bash
supabase migration up
```

### migrationファイル追加後の型定義生成

migrationファイルの追加や編集で、テーブルの追加や更新を行った場合は、型定義を生成してください。

```
npx supabase gen types typescript --local > lib/types/supabase.ts
```

## E2Eテスト

このプロジェクトでは、Playwrightを使用したE2Eテストを実装しています。テストは`tests/e2e`ディレクトリに配置されています。

### テストの実行方法

1. テスト実行前に、ローカル開発環境が起動していることを確認してください:

   ```bash
   supabase start
   ```

2. 以下のコマンドですべてのテストを実行できます:

   ```bash
   npm run test:e2e
   ```

3. 特定のテストファイルのみを実行する場合:

   ```bash
   npm run test:e2e -- tests/e2e/auth.spec.ts
   ```

4. 特定のプロジェクト（ブラウザ/デバイス）でのみテストを実行する場合:

   ```bash
   # デスクトップブラウザ
   npm run test:e2e -- --project=chromium
   npm run test:e2e -- --project=firefox
   npm run test:e2e -- --project=webkit

   # モバイルデバイス
   npm run test:e2e -- --project=mobile-chrome
   npm run test:e2e -- --project=mobile-safari
   ```

5. UIモードでテストを実行する場合（デバッグに便利）:

   ```bash
   npm run test:e2e:ui
   ```

### テストレポートの確認

テスト実行後、HTMLレポートが生成されます。以下のコマンドで確認できます:

```bash
npx playwright show-report
```

### テストの追加方法

新しいテストを追加する場合は、以下のファイル構造に従ってください:

- `tests/e2e/`: すべてのE2Eテストファイルを配置
- `tests/e2e-test-helpers.ts`: テスト用のヘルパー関数と拡張されたテストフィクスチャ

テストファイル命名規則: `機能名.spec.ts`

## RLSテスト

このプロジェクトでは、Supabaseの行レベルセキュリティ（RLS）ポリシーのテストを実装しています。テストは`tests/rls`ディレクトリに配置されています。

### テストの実行方法

1. テスト実行前に、`.env`ファイルを設定してください（本番環境ではなくテスト環境のSupabase情報を使用）:

   ```bash
   # .env.test の例
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. 以下のコマンドですべてのRLSテストを実行できます:

   ```bash
   npm run test:rls
   ```

### テストの概要

RLSテストは以下のテーブルに対して実装されています:

- `private-users.test.ts` - private_usersテーブルのRLSポリシーをテスト
- `public-user-profiles.test.ts` - public_user_profilesテーブルのRLSポリシーをテスト
- `achievements.test.ts` - achievementsテーブルのRLSポリシーをテスト
- `missions.test.ts` - missionsテーブルのRLSポリシーをテスト

### テストの構造

各テストファイルは以下の構造に従っています：

1. **テストユーザーの作成**: `utils.ts`を使用して異なる権限を持つテストユーザーを作成
2. **データ操作テスト**: 各テーブルに対する挿入・参照・更新・削除操作の権限をテスト
3. **ポリシー検証**: 各RLSポリシーが正しく機能することを検証

### 新しいテーブルのテスト追加方法

1. `tests/rls`ディレクトリに新しいテストファイルを作成します
2. `utils.ts`の関数を使用してテストユーザーを作成・管理します
3. テーブルごとのRLSポリシーに応じたテストを記述します
4. テストを実行して結果を確認します

### 注意事項

- テストはテスト用のデータベースで実行してください
- テスト中にデータベースにテストデータが作成されますが、テスト後にクリーンアップされます
- テスト用のユーザーも自動的に作成・削除されます
- テスト実行前にRLSが有効になっていることを確認してください
- 各テストでは、成功ケースと失敗ケースの両方をテストすることが重要です

## storybookの実行

```bash
npm run storybook
```

`stories`ディレクトリにstorybookのファイルを配置してください。

## デプロイ

## 環境変数のデプロイ
1. Terraform Cloudへの招待をもらう

   * [Terraform Cloud Workspaces](https://app.terraform.io/app/gamification/workspaces)

2. 環境ごとの管理状況：

   * **action-board-staging** → `release/infra/develop`
   * **action-board-production** → `release/infra/production`

3. トリガー時の挙動：

   * 現状、Terraform Cloud側で自動で`plan`を実行し、`apply`はUIから手動確認後の実行となります。

4. 環境変数追加手順：

   * 通常の環境変数：

     * `terraform/variables.tf`に追加
     * `nextjs-app/variables.tf`に追加
     * `nextjs-app/cloud_build.tf`の`substitutions`に追加
     * `cloudbuild.yaml`の`arg`経由でDockerビルド時に渡す
   * 秘匿情報の場合：

     * `nextjs-app/secrets.tf`にSecret定義追加
     * `nextjs-app/cloud_build.tf`でSecretへのアクセス権限設定

5. Terraform変数（秘匿情報は`sensitive`チェック）の登録先：

   * [Staging Variables](https://app.terraform.io/app/gamification/workspaces/action-board-staging/variables)
   * [Production Variables](https://app.terraform.io/app/gamification/workspaces/action-board-production/variables)

---

# for CodeRabbit
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/team-mirai-volunteer/action-board?utm_source=oss&utm_medium=github&utm_campaign=team-mirai-volunteer%2Faction-board&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

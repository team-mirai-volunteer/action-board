# Supabase RLSテスト

このディレクトリには、Supabaseのデータベースに対する行レベルセキュリティ（RLS）ポリシーのテストが含まれています。これらのテストはアプリケーションのセキュリティを確保するために重要です。

## テストの実行方法

1. `.env.test`ファイルを設定する（本番環境ではなくテスト環境のSupabase情報を使用してください）
2. 次のコマンドを実行します：

```sh
npm run test:supabase
```

## テストの概要

- `private-users.test.ts` - private_usersテーブルのRLSポリシーをテスト
- `public-user-profiles.test.ts` - public_user_profilesテーブルのRLSポリシーをテスト
- `achievements.test.ts` - achievementsテーブルのRLSポリシーをテスト
- `missions.test.ts` - missionsテーブルのRLSポリシーをテスト

## RLSポリシーの説明

このアプリケーションでは以下のRLSポリシーが実装されています：

### private_users
- **insert_own_user**: 認証済みユーザーのみが自分のレコードを挿入可能
- **select_own_user**: 認証済みユーザーのみが自分のレコードを参照可能
- **update_own_user**: 認証済みユーザーのみが自分のレコードを更新可能

### public_user_profiles
- **select_all_public_user_profiles**: すべてのユーザーがすべてのレコードを参照可能
- 直接の挿入・更新・削除はできない（トリガーで自動更新される）

### achievements
- **insert_own_achievement**: 認証済みユーザーのみが自分の達成を記録可能
- **select_all_achievements**: すべてのユーザーがすべての達成記録を参照可能

### missions
- **select_all_missions**: すべてのユーザーがすべてのミッションを参照可能
- 挿入・更新・削除のポリシーはない（管理者のみが可能）

## 新しいテーブルのテスト追加方法

1. `tests/rls`ディレクトリに新しいテストファイルを作成します
2. `utils.ts`の関数を使用してテストユーザーを作成・管理します
3. テーブルごとのRLSポリシーに応じたテストを記述します
4. テストを実行して結果を確認します

## 注意事項

- テストはテスト用のデータベースで実行してください
- テスト中にデータベースにテストデータが作成されますが、テスト後にクリーンアップされます
- テスト用のユーザーも自動的に作成・削除されます

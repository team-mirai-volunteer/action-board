# TikTok for Developers セットアップ手順

TikTok OAuth連携機能を利用するための開発者アカウント設定手順です。

## 1. TikTok for Developers アカウント作成

1. [TikTok for Developers](https://developers.tiktok.com/) にアクセス
2. 右上の「Log in」をクリック
3. TikTokアカウントでログイン（アカウントがない場合は作成）

## 2. アプリの作成（Sandbox）

> **重要:** TikTokでは最初に「Sandbox」アプリを作成します。Sandboxは開発・テスト用の環境で、審査なしで開発者自身のアカウントでテストできます。

### 2.1 新規Sandboxアプリ作成

1. ログイン後、「Manage apps」または「My Apps」に移動
2. 「Create app」をクリック
3. **「Sandbox」** を選択（本番公開前のテスト用）
4. 以下の情報を入力：

| 項目 | 入力内容 |
|------|----------|
| App name | Action Board（任意の名前） |
| App icon | アプリのアイコン画像（任意） |
| Category | 適切なカテゴリを選択 |

## 3. ローカル開発用トンネルの設定

> **重要:** TikTokのRedirect URIには `localhost` を使用できません。ローカル開発時は **ngrok** や **tunnelmole** などのトンネリングツールを使用してHTTPS URLを取得する必要があります。

## 4. Login Kit の設定

### 4.1 Login Kit を追加

1. アプリ詳細ページで「Add products」をクリック
2. 「Login Kit」を選択して追加

### 4.2 Login Kit の設定

| 項目 | 設定値 |
|------|--------|
| Redirect URI (開発用) | `https://xxxx-xxx-xxx.ngrok-free.app/auth/tiktok-callback` |
| Redirect URI (本番) | `https://your-domain.com/auth/tiktok-callback` |

> **注意:** 開発用のRedirect URIは、ngrok等で取得したHTTPS URLを使用してください。

## 5. スコープの設定

以下のスコープを申請・有効化：

| スコープ | 説明 | 必須 |
|----------|------|------|
| `user.info.basic` | ユーザー基本情報（open_id, display_name, avatar_url） | ✅ |
| `video.list` | ユーザーの動画一覧取得 | ✅ |

### スコープ申請手順

1. 「Scopes」セクションに移動
2. 必要なスコープにチェックを入れる
3. 利用目的の説明を記入（審査用）

**user.info.basic の利用目的例：**
```
To identify users and display their TikTok profile information
(display name and avatar) on their account settings page after linking.
```

**video.list の利用目的例：**
```
To retrieve users' video list and filter videos with specific campaign hashtags
(#チームみらい) for registration and statistics tracking on our platform.
```

## 6. 認証情報の取得

アプリ設定ページから以下の情報を取得：

| 項目 | 環境変数名 |
|------|------------|
| Client Key | `NEXT_PUBLIC_TIKTOK_CLIENT_KEY` |
| Client Secret | `TIKTOK_CLIENT_SECRET` |

## 7. 環境変数の設定

### 7.1 ローカル開発環境（.env.local）

```bash
# TikTok Login credentials
NEXT_PUBLIC_TIKTOK_CLIENT_KEY=your-tiktok-client-key
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret
```

### 7.2 本番環境

本番環境のシークレット管理システム（Vercel、Cloud Run等）に同様の環境変数を設定。

## 8. アプリの審査・公開

### 8.1 Sandboxモード

- 審査不要で、開発者自身のTikTokアカウントでテスト可能
- 他のユーザーは利用不可
- まずはこのモードで動作確認を行う

### 8.2 本番公開（Production）

1. 「Submit for review」をクリック
2. 審査に必要な情報を入力：
   - プライバシーポリシーURL
   - 利用規約URL
   - アプリのスクリーンショット
3. 審査承認後、一般ユーザーが利用可能に

## 9. 動作確認

### 9.1 ローカル環境での確認

1. ngrok等でトンネルを起動: `ngrok http 3000`
2. 取得したHTTPS URLをTikTok Developer PortalのRedirect URIに設定
3. `npm run dev` で開発サーバー起動
4. **ngrokのURL経由で** アプリにアクセス（例: `https://xxxx.ngrok-free.app`）
5. ログイン後、`/settings/tiktok` にアクセス
6. 「TikTokアカウントを連携」ボタンをクリック
7. TikTokの認証画面で許可
8. コールバック後、連携完了を確認
9. 「動画を同期」ボタンで #チームみらい 動画を取得

### 9.2 確認項目

- [ ] TikTok認証画面にリダイレクトされる
- [ ] 認証後、`/settings/tiktok?linked=true` にリダイレクトされる
- [ ] 連携済み状態が表示される
- [ ] 動画同期で #チームみらい 動画が取得される

## トラブルシューティング

### エラー: invalid_client

**原因:** Client KeyまたはClient Secretが間違っている

**対処:**
1. TikTok Developer Portalで認証情報を再確認
2. 環境変数が正しく設定されているか確認
3. 環境変数を変更した場合は開発サーバーを再起動

### エラー: redirect_uri_mismatch

**原因:** Redirect URIが一致しない

**対処:**
1. TikTok Developer Portalで登録したRedirect URIを確認
2. `http://[ngrok等のURL]/auth/tiktok-callback` が登録されているか確認
3. httpとhttpsの違いに注意

### エラー: access_denied

**原因:** ユーザーが認証をキャンセルした

**対処:** 正常な動作。ユーザーに再度連携を促す。

### 動画が取得できない

**原因1:** `video.list` スコープが未承認

**対処:** TikTok Developer Portalでスコープの審査状況を確認

**原因2:** #チームみらい タグ付き動画がない

**対処:** テスト用に #チームみらい または #teammirai タグ付き動画を投稿

## 参考リンク

- [TikTok for Developers](https://developers.tiktok.com/)
- [TikTok Login Kit Documentation](https://developers.tiktok.com/doc/login-kit-web/)
- [TikTok Display API Documentation](https://developers.tiktok.com/doc/display-api-overview/)
- [TikTok OAuth 2.0 Authorization](https://developers.tiktok.com/doc/oauth-user-access-token-management/)

## 審査リクエスト
```
Overview:
Action Board helps Team Mirai volunteers track and visualize their social media impact. By connecting TikTok, users can automatically track their #チームみらい videos, monitor view/like growth over time, and earn points for their content creation activities. This motivates volunteers and recognizes their con

Login Kit Usage:
Users connect their TikTok account via Settings page to link their profile.

Scopes:

1. user.info.basic
- Display connected TikTok account name and avatar in settings
- Allow users to verify which account is linked

2. video.list
- Fetch user's own videos to find those with #チームみらい or #teammirai hashtags
- Register matching videos to track content creation activities
- Display video statistics (views, likes, comments) on user profile
- Videos synced only when user clicks "Sync Videos" button

Data Handling:
- Store only video metadata (title, URL, statistics)
- Do NOT download actual video content
- Users can disconnect anytime, removing all stored data
```

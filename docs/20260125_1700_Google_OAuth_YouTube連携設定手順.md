# Google OAuth / YouTube連携 設定手順

## 概要

ユーザーがGoogleアカウントを連携し、自分がアップロードした#チームみらい動画を確認できる機能のためのOAuth設定手順。

## 前提条件

- Google Cloud Platform (GCP) プロジェクトへのアクセス権限
- YouTube Data API v3 の有効化権限

## 1. Google Cloud Console での設定

### 1.1 プロジェクトの選択/作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 既存のプロジェクトを選択、または新規プロジェクトを作成

### 1.2 YouTube Data API v3 の有効化

1. 左メニューから「APIとサービス」→「ライブラリ」を選択
2. 「YouTube Data API v3」を検索
3. 「有効にする」をクリック

### 1.3 OAuth同意画面の設定

1. 左メニューから「APIとサービス」→「OAuth同意画面」を選択
2. User Type を選択:
   - **内部**: G Suite/Workspace組織内のユーザーのみ（審査不要）
   - **外部**: 一般公開（審査が必要）

3. 「作成」をクリック

#### アプリ情報の入力

| 項目 | 設定値 |
|------|--------|
| アプリ名 | チームみらい アクションボード |
| ユーザーサポートメール | (管理者のメールアドレス) |
| アプリのロゴ | (任意) |
| アプリのホームページ | https://your-domain.com |
| アプリのプライバシーポリシーリンク | https://your-domain.com/privacy |
| アプリの利用規約リンク | https://your-domain.com/terms |
| 承認済みドメイン | your-domain.com |
| デベロッパーの連絡先メールアドレス | (管理者のメールアドレス) |

#### スコープの設定

「スコープを追加または削除」をクリックし、以下を追加:

| スコープ | 説明 |
|---------|------|
| `https://www.googleapis.com/auth/youtube.readonly` | YouTubeアカウント情報の読み取り |

**注意**: `youtube.readonly` は**機密性の高いスコープ**に分類されるため、本番公開には審査が必要です。

#### テストユーザーの追加（外部の場合）

審査前のテスト段階では、テストユーザーとして登録されたGoogleアカウントのみがOAuth認証を利用できます。

1. 「テストユーザー」セクションで「ADD USERS」をクリック
2. テストに使用するGoogleアカウントのメールアドレスを追加

### 1.4 OAuth 2.0 クライアントIDの作成

1. 左メニューから「APIとサービス」→「認証情報」を選択
2. 「認証情報を作成」→「OAuthクライアントID」を選択
3. アプリケーションの種類:「ウェブアプリケーション」を選択

#### 認証情報の入力

| 項目 | 設定値 |
|------|--------|
| 名前 | Action Board YouTube連携 |
| 承認済みのJavaScriptオリジン | (下記参照) |
| 承認済みのリダイレクトURI | (下記参照) |

#### 承認済みのJavaScriptオリジン

```
# ローカル開発
http://localhost:3000

# ステージング環境
https://staging.your-domain.com

# 本番環境
https://your-domain.com
```

#### 承認済みのリダイレクトURI

```
# ローカル開発
http://localhost:3000/auth/youtube-callback

# ステージング環境
https://staging.your-domain.com/auth/youtube-callback

# 本番環境
https://your-domain.com/auth/youtube-callback
```

4. 「作成」をクリック
5. 表示される**クライアントID**と**クライアントシークレット**をメモ

## 2. 環境変数の設定

### 2.1 ローカル開発環境

`.env.local` に以下を追加:

```env
# Google OAuth (YouTube連携)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### 2.2 ステージング/本番環境

#### Terraform変数 (terraform.tfvars)

```hcl
NEXT_PUBLIC_GOOGLE_CLIENT_ID = "your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET         = "your-client-secret"
```

#### Secret Manager

Terraformを実行すると、`GOOGLE_CLIENT_SECRET` は自動的にGoogle Secret Managerに保存されます。

シークレット名: `{app_name}-{environment}-google-client-secret`

## 3. 動作確認

### 3.1 ローカルでのテスト

1. 開発サーバーを起動
   ```bash
   npm run dev
   ```

2. ブラウザで以下にアクセス
   ```
   http://localhost:3000/settings/youtube
   ```

3. 「YouTubeアカウントを連携する」ボタンをクリック

4. Googleログイン画面が表示されることを確認

5. テストユーザーでログインし、権限を許可

6. コールバック後、連携成功メッセージが表示されることを確認

### 3.2 確認項目

- [ ] OAuth同意画面が正しく表示される
- [ ] 要求されるスコープが `youtube.readonly` のみ
- [ ] 認証後、正しいリダイレクトURIに戻る
- [ ] チャンネル情報（名前、アバター）が表示される
- [ ] アップロード動画一覧が表示される（該当動画がある場合）
- [ ] 連携解除が正常に動作する

## 4. 本番公開に向けた審査

### 4.1 審査が必要なケース

`youtube.readonly` スコープは機密性の高いスコープのため、外部ユーザーに公開する場合はGoogleの審査が必要です。

### 4.2 審査申請の準備

1. **プライバシーポリシー**: データの取り扱いを明記
2. **利用規約**: サービスの利用条件を明記
3. **デモ動画**: OAuth認証フローを録画（YouTube限定公開など）
4. **スコープの正当性**: なぜこのスコープが必要かの説明

### 4.3 審査申請手順

1. OAuth同意画面で「アプリを公開」をクリック
2. 必要な情報を入力
3. 確認用の動画またはスクリーンショットをアップロード
4. 審査を送信

**審査期間**: 通常1〜4週間

### 4.4 審査中の制限

- テストユーザーとして登録された最大100アカウントのみ利用可能
- 「このアプリは確認されていません」警告が表示される

## 5. トラブルシューティング

### エラー: redirect_uri_mismatch

**原因**: リダイレクトURIがGoogle Cloud Consoleの設定と一致しない

**解決策**:
1. Google Cloud Console で承認済みリダイレクトURIを確認
2. 末尾のスラッシュの有無を確認（`/auth/youtube-callback` vs `/auth/youtube-callback/`）
3. プロトコル（http vs https）を確認

### エラー: access_denied

**原因**: ユーザーが権限を拒否、またはテストユーザーに登録されていない

**解決策**:
1. テストユーザーとして登録されているか確認
2. OAuth同意画面の設定を確認

### エラー: invalid_client

**原因**: クライアントIDまたはシークレットが間違っている

**解決策**:
1. 環境変数の値を確認
2. Google Cloud Consoleで認証情報を再確認

### トークンリフレッシュエラー

**原因**: リフレッシュトークンが無効化された

**解決策**:
1. ユーザーに再連携を依頼
2. Googleアカウントの「サードパーティアプリのアクセス」から連携を解除後、再連携

## 6. APIクォータ

### YouTube Data API v3 のクォータ

| 項目 | 制限 |
|------|------|
| 1日あたりのクォータ | 10,000 units |
| channels.list | 1 unit/リクエスト |

### クォータ増加申請

クォータが不足する場合:
1. Google Cloud Console →「APIとサービス」→「クォータ」
2. 「クォータを引き上げる」をリクエスト

## 7. セキュリティ考慮事項

### 7.1 トークンの保管

- アクセストークン・リフレッシュトークンは `youtube_user_connections` テーブルに保存
- RLSで `service_role` のみアクセス可能に設定済み
- クライアントサイドからは直接アクセス不可

### 7.2 スコープの最小化

- 必要最小限のスコープ（`youtube.readonly`）のみ要求
- 書き込み権限は要求しない

### 7.3 トークンの有効期限

- アクセストークン: 約1時間で期限切れ
- リフレッシュトークン: 長期間有効（ただしユーザーが取り消し可能）

## 8. ブランドガイドライン

### 8.1 Googleボタンの要件

Google OAuthを使用するボタンは、[Sign in with Google Branding Guidelines](https://developers.google.com/identity/branding-guidelines) に準拠する必要があります。

#### 必須要件

| 項目 | 要件 |
|------|------|
| **Googleロゴ** | 標準カラー版（4色）のみ使用可、サイズ・色の変更禁止 |
| **フォント** | Roboto Medium 推奨 |
| **テキスト** | "Sign in with Google", "Continue with Google" など |
| **配置** | 他のSNSログインボタンと同等以上の目立ち方 |

#### 許可されたカラーテーマ

| テーマ | 背景色 | 枠線 | テキスト色 |
|--------|--------|------|-----------|
| Light | #FFFFFF | #747775 (1px) | #1F1F1F |
| Dark | #131314 | #8E918F (1px) | #E3E3E3 |
| Neutral | #F2F2F2 | なし | #1F1F1F |

#### 禁止事項

- Googleロゴ単体での使用（ボタン枠・テキストなし）
- モノクロ版ロゴの使用
- カスタムアイコンの作成
- "Google" だけのテキスト
- ロゴの色・サイズ変更
- 色付き背景上への標準カラーロゴ配置

### 8.2 本プロジェクトでの実装

`src/features/youtube/components/youtube-link-button.tsx` で以下のように実装:

```tsx
// Google "G" ロゴ（公式カラー版）- SVGで4色を正確に再現
<GoogleIcon className="w-5 h-5" />

// ボタンスタイル（Light テーマ）
<button
  className="bg-white border border-[#747775] rounded-md"
  style={{ fontFamily: "Roboto, sans-serif" }}
>
  <GoogleIcon />
  <span className="text-[#1F1F1F] text-sm font-medium">
    Googleで続行（YouTube連携）
  </span>
</button>
```

### 8.3 審査時の注意

ブランドガイドラインに準拠していない場合、OAuth審査で指摘される可能性があります。

## 参考リンク

- [Google OAuth 2.0 ドキュメント](https://developers.google.com/identity/protocols/oauth2)
- [YouTube Data API v3 リファレンス](https://developers.google.com/youtube/v3/docs)
- [OAuth同意画面の設定](https://support.google.com/cloud/answer/6158849)
- [APIスコープの確認](https://developers.google.com/identity/protocols/oauth2/scopes#youtube)
- [Sign in with Google Branding Guidelines](https://developers.google.com/identity/branding-guidelines)

"use client";

/**
 * YouTubeアカウント連携開始関数
 * Google OAuth 2.0 を使用してGoogle認証ページにリダイレクト
 */
export async function linkYouTubeAccount(returnUrl?: string) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set");
    throw new Error(
      "YouTube認証の設定が不完全です。管理者にお問い合わせください。",
    );
  }

  const redirectUri = `${window.location.origin}/auth/youtube-callback`;
  const state = crypto.randomUUID();

  // stateをローカルストレージに保存（CSRF対策）
  localStorage.setItem("youtubeLoginState", state);

  // returnUrlをローカルストレージに保存（リダイレクト用）
  if (returnUrl) {
    localStorage.setItem("youtubeLoginReturnUrl", returnUrl);
  }

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set(
    "scope",
    "https://www.googleapis.com/auth/youtube.readonly",
  );
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");

  // Google認証ページにリダイレクト
  window.location.href = authUrl.toString();
}

/**
 * YouTube連携を解除する（クライアント側のストレージクリア）
 */
export function clearYouTubeLocalStorage() {
  localStorage.removeItem("youtubeLoginState");
  localStorage.removeItem("youtubeLoginReturnUrl");
}

"use client";

/**
 * LINEログイン開始関数
 * LINE Web Login API を直接使用してLINE認証ページにリダイレクト
 */
export async function signInWithLine(returnUrl?: string) {
  // LINE Web Login API の認証URL作成
  const clientId = process.env.NEXT_PUBLIC_LINE_CLIENT_ID;
  if (!clientId) {
    console.error("NEXT_PUBLIC_LINE_CLIENT_ID is not set");
    throw new Error(
      "LINE認証の設定が不完全です。管理者にお問い合わせください。",
    );
  }

  const redirectUri = `${window.location.origin}/api/auth/callback/line`;
  const state = crypto.randomUUID();

  // stateをローカルストレージに保存（CSRF対策、モバイル対応）
  localStorage.setItem("lineLoginState", state);

  // returnUrlをローカルストレージに保存（リダイレクト用）
  if (returnUrl) {
    localStorage.setItem("lineLoginReturnUrl", returnUrl);
  }

  const authUrl = new URL("https://access.line.me/oauth2/v2.1/authorize");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("scope", "profile openid email");

  // LINE認証ページにリダイレクト
  window.location.href = authUrl.toString();
}

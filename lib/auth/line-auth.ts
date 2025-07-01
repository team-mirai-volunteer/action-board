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
  const stateData = {
    csrf: crypto.randomUUID(),
    returnUrl: returnUrl || null,
  };
  const state = btoa(JSON.stringify(stateData));

  // stateをローカルストレージに保存（CSRF対策、モバイル対応）
  localStorage.setItem("lineLoginState", stateData.csrf);

  const authUrl = new URL("https://access.line.me/oauth2/v2.1/authorize");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("scope", "profile openid email");

  // LINE認証ページにリダイレクト
  window.location.href = authUrl.toString();
}

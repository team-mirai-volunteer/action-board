"use client";

import { base64UrlEncode } from "../utils/auth-helpers";

/**
 * TikTokアカウント連携開始関数
 * TikTok Display API を使用してTikTok認証ページにリダイレクト
 */
export async function linkTikTokAccount(returnUrl?: string) {
  const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
  if (!clientKey) {
    console.error("NEXT_PUBLIC_TIKTOK_CLIENT_KEY is not set");
    throw new Error(
      "TikTok認証の設定が不完全です。管理者にお問い合わせください。",
    );
  }

  const redirectUri = `${window.location.origin}/auth/tiktok-callback`;
  const state = crypto.randomUUID();
  // TikTok requires a code_verifier for PKCE
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // stateとcode_verifierをローカルストレージに保存（CSRF対策、PKCE）
  localStorage.setItem("tiktokLoginState", state);
  localStorage.setItem("tiktokCodeVerifier", codeVerifier);

  // returnUrlをローカルストレージに保存（リダイレクト用）
  if (returnUrl) {
    localStorage.setItem("tiktokLoginReturnUrl", returnUrl);
  }

  const authUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
  authUrl.searchParams.set("client_key", clientKey);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "user.info.basic,video.list");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  // TikTok認証ページにリダイレクト
  window.location.href = authUrl.toString();
}

/**
 * PKCE用のcode_verifierを生成
 */
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * PKCE用のcode_challengeを生成（S256）
 */
async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
}

/**
 * TikTok連携を解除する（クライアント側のストレージクリア）
 */
export function clearTikTokLocalStorage() {
  localStorage.removeItem("tiktokLoginState");
  localStorage.removeItem("tiktokCodeVerifier");
  localStorage.removeItem("tiktokLoginReturnUrl");
}

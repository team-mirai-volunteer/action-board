import type { User } from "@supabase/supabase-js";

/**
 * ユーザーの認証プロバイダーを取得
 */
export function getAuthProviders(user: User): string[] {
  return (user.app_metadata as { providers?: string[] })?.providers || [];
}

/**
 * LINE認証ユーザーかどうかを判定
 */
export function isLineUser(user: User): boolean {
  const providers = getAuthProviders(user);
  return providers.includes("line");
}

/**
 * Email/Password認証ユーザーかどうかを判定
 */
export function isEmailUser(user: User): boolean {
  const providers = getAuthProviders(user);
  return providers.includes("email");
}

/**
 * 認証方法の表示名を取得
 * 1ユーザー1認証方法が前提
 */
export function getAuthMethodDisplayName(user: User): string {
  if (isLineUser(user)) {
    return "LINEログイン";
  }
  if (isEmailUser(user)) {
    return "メールアドレスログイン";
  }
  return "不明";
}

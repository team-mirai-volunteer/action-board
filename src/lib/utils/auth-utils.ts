import type { User } from "@supabase/supabase-js";

/**
 * LINE認証ユーザーかどうかを判定
 */
export function isLineUser(user: User): boolean {
  const userMetadataProvider = (user.user_metadata as { provider?: string })
    ?.provider;
  return userMetadataProvider === "line";
}

/**
 * Email/Password認証ユーザーかどうかを判定
 * 直接判定する方法がないため、LINEユーザーでない場合のみEmailユーザーと判定
 */
export function isEmailUser(user: User): boolean {
  // まずLINEユーザーかチェック
  if (isLineUser(user)) {
    return false;
  } else {
    return true;
  }
}

/**
 * 認証方法の表示名を取得
 * 1ユーザー1認証方法が前提
 */
export function getAuthMethodDisplayName(user: User): string {
  if (isLineUser(user)) {
    return "LINEログイン";
  } else {
    return "メールアドレスログイン";
  }
}

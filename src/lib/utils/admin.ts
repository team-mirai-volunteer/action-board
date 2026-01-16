import type { User } from "@supabase/supabase-js";

/**
 * ユーザーが管理者かどうかをチェックする
 * raw_app_meta_data.roles に "admin" が含まれているかを確認
 * @param user Supabase User オブジェクト
 * @returns 管理者の場合 true
 */
export function isAdmin(user: User | null): boolean {
  if (!user) return false;

  const roles = user.app_metadata?.roles;
  if (!Array.isArray(roles)) return false;

  return roles.includes("admin");
}

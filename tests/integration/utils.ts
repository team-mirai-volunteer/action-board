export { adminClient, cleanupTestUser } from "../supabase/utils";

import { adminClient } from "../supabase/utils";

/**
 * auth.usersからユーザーを取得する
 */
export async function getUserById(userId: string) {
  const { data, error } = await adminClient.auth.admin.getUserById(userId);
  if (error) {
    throw new Error(`ユーザーの取得に失敗しました: ${error.message}`);
  }
  return data.user;
}

/**
 * LINE user IDでユーザーを検索する
 */
export async function findUserByLineId(lineUserId: string) {
  const { data, error } = await adminClient.rpc("get_user_by_line_id", {
    line_user_id: lineUserId,
  });
  if (error) {
    throw new Error(`LINE IDでのユーザー検索に失敗しました: ${error.message}`);
  }
  return data?.[0] ?? null;
}

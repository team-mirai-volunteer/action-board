import "server-only";
import { cache } from "react";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/supabase";

export const getUser = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

export const getMyProfile = cache(async () => {
  const user = await getUser();
  if (!user) {
    console.error("User not found");
    throw new Error("ユーザー（認証）が見つかりません");
  }
  const supabaseClient = await createClient();
  const { data: privateUser } = await supabaseClient
    .from("private_users")
    .select("*")
    .eq("id", user.id)
    .single();
  return privateUser;
});

export const getProfile = cache(async (userId: string) => {
  const supabaseClient = await createClient();
  const { data: privateUser } = await supabaseClient
    .from("public_user_profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return privateUser;
});

export async function updateProfile(
  user: Tables<"private_users">,
): Promise<Tables<"private_users"> | null> {
  const supabaseClient = await createClient();

  // 先にユーザー情報を取得
  const { data: authUser } = await supabaseClient.auth.getUser();
  if (!authUser) {
    console.error("User not found");
    throw new Error("ユーザー（認証）が見つかりません");
  }

  const { data: privateUser } = await supabaseClient
    .from("private_users")
    .select("*")
    .eq("id", user.id)
    .single();

  // private_users テーブルを更新
  if (!privateUser) {
    const { data: updated, error: privateUserError } = await supabaseClient
      .from("private_users")
      .insert(user);

    if (privateUserError) {
      console.error("Error updating private_users:", privateUserError);
      throw new Error("ユーザー情報の更新に失敗しました");
    }
    return updated;
  }

  const { data: updated, error: privateUserError } = await supabaseClient
    .from("private_users")
    .update(user)
    .eq("id", user.id);
  if (privateUserError) {
    console.error("Error updating private_users:", privateUserError);
    throw new Error("ユーザー情報の更新に失敗しました");
  }
  return updated;
}

export async function deleteAccount(): Promise<void> {
  const supabaseClient = await createClient();
  const supabaseServiceClient = await createServiceClient();

  // 現在のユーザー情報を取得
  const { data: authUser } = await supabaseClient.auth.getUser();
  if (!authUser.user) {
    throw new Error("ユーザー（認証）が見つかりません");
  }

  const userId = authUser.user.id;

  // 1. ユーザーに関連するデータを削除（Service Role Keyを使用してRLSを回避）
  const deletionResults = [];

  // achievements テーブルの削除（RLS許可済み）
  const { error: achievementsError } = await supabaseClient
    .from("achievements")
    .delete()
    .eq("user_id", userId);
  deletionResults.push({ table: "achievements", error: achievementsError });

  // xp_transactions テーブルの削除（Service Role必要）
  const { error: xpError } = await supabaseServiceClient
    .from("xp_transactions")
    .delete()
    .eq("user_id", userId);
  deletionResults.push({ table: "xp_transactions", error: xpError });

  // user_levels テーブルの削除（Service Role必要）
  const { error: levelsError } = await supabaseServiceClient
    .from("user_levels")
    .delete()
    .eq("user_id", userId);
  deletionResults.push({ table: "user_levels", error: levelsError });

  // public_user_profiles テーブルの削除（Service Role必要）
  const { error: publicProfileError } = await supabaseServiceClient
    .from("public_user_profiles")
    .delete()
    .eq("id", userId);
  deletionResults.push({
    table: "public_user_profiles",
    error: publicProfileError,
  });

  // private_users テーブルの削除（Service Role必要）
  const { error: privateUserError } = await supabaseServiceClient
    .from("private_users")
    .delete()
    .eq("id", userId);
  deletionResults.push({ table: "private_users", error: privateUserError });

  // user_referral テーブルの削除（紹介コード情報）
  const { error: referralError } = await supabaseServiceClient
    .from("user_referral")
    .delete()
    .eq("user_id", userId);
  deletionResults.push({ table: "user_referral", error: referralError });

  // 削除結果をログ出力
  console.log("退会処理の削除結果:", deletionResults);

  // エラーがあった場合の処理
  const errors = deletionResults.filter((result) => result.error);
  if (errors.length > 0) {
    console.error("一部のデータ削除に失敗しました:", errors);
  }

  // 2. サインアウト（データベース上のデータは削除済み）
  await supabaseClient.auth.signOut();
}

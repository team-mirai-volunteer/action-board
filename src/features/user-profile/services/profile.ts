import { cache } from "react";

import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/supabase";

export const getUser = cache(async () => {
  const supabase = createClient();

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
  const supabaseClient = createClient();
  const { data: privateUser } = await supabaseClient
    .from("private_users")
    .select("*")
    .eq("id", user.id)
    .single();
  return privateUser;
});

export const getProfile = cache(async (userId: string) => {
  const supabaseClient = createClient();
  const { data: privateUser } = await supabaseClient
    .from("public_user_profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return privateUser;
});

/**
 * ユーザーのプライベート情報が存在するかチェック
 * @param userId ユーザーID
 * @returns プライベートユーザー情報が存在する場合true
 */
export async function hasPrivateProfile(userId: string): Promise<boolean> {
  const supabaseClient = createClient();
  const { data: privateUser } = await supabaseClient
    .from("private_users")
    .select("id")
    .eq("id", userId)
    .single();

  return !!privateUser;
}

export async function updateProfile(
  user: Tables<"private_users">,
): Promise<Tables<"private_users"> | null> {
  const supabaseClient = createClient();

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
  const supabaseClient = createClient();
  const supabaseAdmin = await createAdminClient();

  // 現在のユーザー情報を取得
  const { data: authUser } = await supabaseClient.auth.getUser();
  if (!authUser.user) {
    throw new Error("ユーザー（認証）が見つかりません");
  }

  const userId = authUser.user.id;

  try {
    // 1. 関連データを削除 - 通常のクライアントを使用（関数内で認証チェック実行）
    const { error: transactionError } = await supabaseClient.rpc(
      "delete_user_account",
      { target_user_id: userId },
    );

    if (transactionError) {
      console.error("退会処理でエラーが発生しました:", transactionError);
      throw new Error(`退会処理に失敗しました: ${transactionError.message}`);
    }

    // 2. auth.users テーブルからユーザーを削除（Admin API使用）
    const { error: authDeleteError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error("認証ユーザー削除でエラーが発生しました:", authDeleteError);
      throw new Error(
        `認証ユーザー削除に失敗しました: ${authDeleteError.message}`,
      );
    }

    console.log("退会処理が正常に完了しました:", userId);
  } catch (error) {
    console.error("退会処理でエラーが発生しました:", error);
    throw error;
  }

  // サインアウト（データベース上のデータは削除済み）
  await supabaseClient.auth.signOut();
}

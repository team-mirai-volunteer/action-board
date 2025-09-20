"use server";

import { deleteAccount } from "@/features/user-profile/services/profile";

export async function deleteAccountAction() {
  try {
    await deleteAccount();
    return { success: true };
  } catch (error) {
    console.error("退会処理でエラーが発生しました:", error);
    throw new Error("退会処理でエラーが発生しました。もう一度お試しください。");
  }
}

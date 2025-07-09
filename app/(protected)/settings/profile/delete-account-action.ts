"use server";

import { deleteAccount } from "@/lib/services/users";
import { redirect } from "next/navigation";

export async function deleteAccountAction() {
  try {
    await deleteAccount();
  } catch (error) {
    console.error("退会処理でエラーが発生しました:", error);
    throw new Error("退会処理でエラーが発生しました。もう一度お試しください。");
  }

  // 削除処理が成功した場合のみリダイレクト
  redirect("/sign-in");
}

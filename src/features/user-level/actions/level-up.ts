"use server";

import { revalidatePath } from "next/cache";
import { markLevelUpNotificationAsSeen } from "@/features/user-level/services/level-up-notification";
import { getUser } from "@/features/user-profile/services/profile";

export async function markLevelUpSeenAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "認証が必要です" };
    }

    const result = await markLevelUpNotificationAsSeen(user.id);
    if (result.success) {
      revalidatePath("/");
    }
    return result;
  } catch (error) {
    console.error("Error in markLevelUpSeenAction:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}

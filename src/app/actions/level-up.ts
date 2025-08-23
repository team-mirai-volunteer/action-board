"use server";

import { markLevelUpNotificationAsSeen } from "@/lib/services/levelUpNotification";
import { getUser } from "@/lib/services/users";

export async function markLevelUpSeenAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "認証が必要です" };
    }

    return await markLevelUpNotificationAsSeen(user.id);
  } catch (error) {
    console.error("Error in markLevelUpSeenAction:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}

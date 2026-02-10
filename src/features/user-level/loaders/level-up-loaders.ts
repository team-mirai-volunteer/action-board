"use server";

import { getUser } from "@/features/user-profile/services/profile";
import { checkLevelUpNotification as checkLevelUpNotificationService } from "../services/level-up-notification";

export async function checkLevelUpNotification() {
  const user = await getUser();
  if (!user) {
    return { shouldNotify: false } as const;
  }
  return checkLevelUpNotificationService(user.id);
}

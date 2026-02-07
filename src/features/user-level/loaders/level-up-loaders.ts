"use server";

import { checkLevelUpNotification as checkLevelUpNotificationService } from "../services/level-up-notification";

export async function checkLevelUpNotification(userId: string) {
  return checkLevelUpNotificationService(userId);
}

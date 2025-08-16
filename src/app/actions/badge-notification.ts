"use server";

import { markBadgeNotificationAsSeen } from "@/lib/services/badgeNotification";
import { createClient } from "@/lib/supabase/client";

export async function markBadgeNotificationAsSeenAction(
  badgeIds: string[],
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  return markBadgeNotificationAsSeen(badgeIds);
}

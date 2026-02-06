"use server";

import { createAdminClient } from "@/lib/supabase/adminClient";
import { markBadgeNotificationAsSeen } from "./services/mark-badges-as-seen";

export async function markBadgeNotificationAsSeenAction(
  badgeIds: string[],
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  // 自分のバッジのみ操作可能にするため、所有者チェックを行う
  const supabaseAdmin = await createAdminClient();
  const { data: userBadges } = await supabaseAdmin
    .from("user_badges")
    .select("id")
    .eq("user_id", user.id)
    .in("id", badgeIds);

  if (!userBadges || userBadges.length === 0) {
    return { success: false, error: "No matching badges found" };
  }

  const authorizedBadgeIds = userBadges.map((b) => b.id);
  return markBadgeNotificationAsSeen(authorizedBadgeIds);
}

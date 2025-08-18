"use server";

import { createClient } from "@/lib/supabase/client";
import { markBadgeNotificationAsSeen } from "./services/mark-badges-as-seen";

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

  // TODO: 認可処理を書いて、自分のバッジのみを操作できるようにする
  // もしくはbadgeIdsを引数でなくて、ここでuser.idから取得するようにする

  return markBadgeNotificationAsSeen(badgeIds);
}

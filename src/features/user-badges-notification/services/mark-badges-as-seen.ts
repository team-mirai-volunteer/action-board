import "server-only";

import { createAdminClient } from "@/lib/supabase/adminClient";

/**
 * バッジを通知済みにマーク
 */
export async function markBadgeNotificationAsSeen(
  badgeIds: string[],
): Promise<{ success: boolean; error?: string }> {
  const supabaseAdmin = await createAdminClient();

  try {
    const { error } = await supabaseAdmin
      .from("user_badges")
      .update({
        is_notified: true,
        updated_at: new Date().toISOString(),
      })
      .in("id", badgeIds);

    if (error) {
      console.error("Error marking badges as notified:", error);
      return { success: false, error: "バッジの通知状態の更新に失敗しました" };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in markBadgesAsNotified:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}

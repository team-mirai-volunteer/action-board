import type { SupabaseClient } from "@supabase/supabase-js";

export type UnlinkTikTokAccountResult =
  | { success: true }
  | { success: false; error: string };

export async function unlinkTikTokAccount(
  supabase: SupabaseClient,
  userId: string,
): Promise<UnlinkTikTokAccountResult> {
  const { error: deleteError } = await supabase
    .from("tiktok_user_connections")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    console.error("Failed to unlink TikTok:", deleteError);
    return {
      success: false,
      error: "TikTok連携解除に失敗しました",
    };
  }

  return { success: true };
}

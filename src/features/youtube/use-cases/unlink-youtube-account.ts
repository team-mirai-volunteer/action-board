import type { SupabaseClient } from "@supabase/supabase-js";

export type UnlinkYouTubeAccountResult =
  | { success: true }
  | { success: false; error: string };

export async function unlinkYouTubeAccount(
  adminSupabase: SupabaseClient,
  userId: string,
): Promise<UnlinkYouTubeAccountResult> {
  const { error: deleteError } = await adminSupabase
    .from("youtube_user_connections")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    console.error("Failed to unlink YouTube:", deleteError);
    return {
      success: false,
      error: "YouTube連携解除に失敗しました",
    };
  }

  return { success: true };
}

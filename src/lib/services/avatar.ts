import type { SupabaseClient } from "@supabase/supabase-js";

export const AVATAR_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function getAvatarUrl(
  client: SupabaseClient,
  avatarPath: string,
): string {
  if (!avatarPath) return "";
  const { data } = client.storage.from("avatars").getPublicUrl(avatarPath, {
    transform: {
      width: 240,
      height: 240,
      resize: "cover",
    },
  });
  return data.publicUrl;
}

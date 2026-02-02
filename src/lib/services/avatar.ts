import { createClient } from "@/lib/supabase/client";

export const AVATAR_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function getAvatarUrl(avatarPath: string): string {
  if (!avatarPath) return "";
  const client = createClient();
  const { data } = client.storage.from("avatars").getPublicUrl(avatarPath);
  return data.publicUrl;
}

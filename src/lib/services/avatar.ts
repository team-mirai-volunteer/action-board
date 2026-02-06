export const AVATAR_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function getAvatarUrl(avatarPath: string): string {
  if (!avatarPath) return "";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/avatars/${avatarPath}`;
}

"use server";

import { getAvatarUrl as getAvatarUrlService } from "@/lib/services/avatar";

export const AVATAR_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function getAvatarUrl(avatarPath: string): string {
  return getAvatarUrlService(avatarPath);
}

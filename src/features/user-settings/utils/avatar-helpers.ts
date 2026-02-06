import { AVATAR_MAX_FILE_SIZE } from "@/lib/services/avatar";

const ALLOWED_AVATAR_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

/**
 * アバターファイルのバリデーション
 * File オブジェクトではなく { size, type } で抽象化し、テストしやすくしている
 */
export function validateAvatarFile(
  file: { size: number; type: string } | null,
): { valid: boolean; error?: string } {
  if (!file || file.size === 0) {
    return { valid: true };
  }

  if (file.size > AVATAR_MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "画像ファイルのサイズは5MB以下にしてください",
    };
  }

  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "対応している画像形式はJPEG、PNG、WebPです",
    };
  }

  return { valid: true };
}

/**
 * 旧アバターを削除すべきかどうかを判定する
 * - 画像が削除された場合（avatar_path が null）
 * - 新しい画像がアップロードされる場合
 */
export function shouldDeleteOldAvatar(
  previousUrl: string | null,
  newPath: string | null,
  hasNewFile: boolean,
): boolean {
  if (!previousUrl) {
    return false;
  }
  return newPath === null || hasNewFile;
}

/**
 * アバターURLからストレージパスを抽出する
 * 例: "https://xxxx.supabase.co/storage/v1/object/public/avatars/userid/12345.jpg"
 *   → "userid/12345.jpg"
 */
export function extractAvatarPathFromUrl(url: string): string | null {
  const match = url.match(/\/avatars\/(.+)$/);
  return match?.[1] ?? null;
}

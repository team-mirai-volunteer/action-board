/**
 * YouTube URL正規化とバリデーション用ユーティリティ
 */

/**
 * YouTube URLを正規化する（youtu.be、youtube.com等の形式を統一）
 */
export function normalizeYouTubeUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);

    if (urlObj.hostname === "youtu.be") {
      const videoId = urlObj.pathname.slice(1);
      return `https://www.youtube.com/watch?v=${videoId}`;
    }

    if (
      urlObj.hostname === "www.youtube.com" ||
      urlObj.hostname === "youtube.com"
    ) {
      const videoId = urlObj.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * URLがYouTube URLかどうかを判定
 */
export function isYouTubeUrl(url: string): boolean {
  return normalizeYouTubeUrl(url) !== null;
}

/**
 * YouTube URL関連のユーティリティ関数
 */

/**
 * YouTube URLから動画IDを抽出する
 * @param url YouTube動画URL
 */
export function extractVideoIdFromUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]+)/,
    /(?:youtu\.be\/)([\w-]+)/,
    /(?:youtube\.com\/embed\/)([\w-]+)/,
    /(?:youtube\.com\/shorts\/)([\w-]+)/,
    /(?:youtube\.com\/live\/)([\w-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * コメントURLを生成する
 * @param videoId 動画ID
 * @param commentId コメントID
 */
export function generateCommentUrl(videoId: string, commentId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}&lc=${commentId}`;
}

/**
 * YouTube URLからコメントIDを抽出する
 * @param url YouTube URL (例: https://www.youtube.com/watch?v=xxx&lc=yyy)
 */
export function extractCommentIdFromUrl(url: string): string | null {
  const pattern = /[?&]lc=([\w-]+)/;
  const match = url.match(pattern);
  return match?.[1] || null;
}

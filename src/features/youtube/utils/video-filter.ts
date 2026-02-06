import type { YouTubeVideoDetail } from "../services/youtube-client";

// #チームみらい を検出する正規表現
export const TEAM_MIRAI_REGEX = /#(チームみらい|teammirai)/i;

/**
 * #チームみらい 動画をフィルタリングする
 */
export function filterTeamMiraiVideos(
  videos: YouTubeVideoDetail[],
): YouTubeVideoDetail[] {
  return videos.filter((video) => {
    const description = video.snippet.description || "";
    const title = video.snippet.title || "";
    const tags = video.snippet.tags || [];

    return (
      TEAM_MIRAI_REGEX.test(description) ||
      TEAM_MIRAI_REGEX.test(title) ||
      tags.some((tag) => TEAM_MIRAI_REGEX.test(tag))
    );
  });
}

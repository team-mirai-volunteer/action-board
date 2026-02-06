import type { TikTokVideoFromAPI } from "../types";

// #チームみらい を検出する正規表現
const TEAM_MIRAI_REGEX = /#(チームみらい|teammirai)/i;

/**
 * #チームみらい 動画をフィルタリングする
 */
export function filterTeamMiraiVideos(
  videos: TikTokVideoFromAPI[],
): TikTokVideoFromAPI[] {
  return videos.filter((video) => {
    const description = video.video_description || "";
    const title = video.title || "";
    return TEAM_MIRAI_REGEX.test(description) || TEAM_MIRAI_REGEX.test(title);
  });
}

jest.mock("server-only", () => ({}));
jest.mock("@/features/tiktok-stats/utils/stats-utils", () => ({}));
jest.mock("@/lib/supabase/adminClient", () => ({}));
jest.mock("@/lib/supabase/client", () => ({}));
jest.mock("@/lib/utils/text-utils", () => ({}));
jest.mock("../utils/data-builders", () => ({}));
jest.mock("./tiktok-client", () => ({}));

import type { TikTokVideoFromAPI } from "../types";
import { filterTeamMiraiVideos } from "./tiktok-video-service";

function makeVideo(
  overrides: Partial<TikTokVideoFromAPI> = {},
): TikTokVideoFromAPI {
  return {
    id: "v1",
    create_time: 1700000000,
    share_url: "https://tiktok.com/v1",
    duration: 30,
    ...overrides,
  };
}

describe("filterTeamMiraiVideos", () => {
  it("should return videos with #チームみらい in description", () => {
    const videos = [
      makeVideo({ video_description: "素敵な動画 #チームみらい です" }),
      makeVideo({ id: "v2", video_description: "関係ない動画" }),
    ];

    const result = filterTeamMiraiVideos(videos);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("v1");
  });

  it("should return videos with #チームみらい in title", () => {
    const videos = [makeVideo({ title: "#チームみらい の活動報告" })];

    const result = filterTeamMiraiVideos(videos);
    expect(result).toHaveLength(1);
  });

  it("should match #teammirai case-insensitively", () => {
    const videos = [
      makeVideo({ video_description: "#TeamMirai video" }),
      makeVideo({ id: "v2", title: "#TEAMMIRAI" }),
      makeVideo({ id: "v3", video_description: "#teammirai" }),
    ];

    const result = filterTeamMiraiVideos(videos);
    expect(result).toHaveLength(3);
  });

  it("should return empty array when no videos match", () => {
    const videos = [
      makeVideo({ video_description: "普通の動画" }),
      makeVideo({ id: "v2", title: "関係ない動画" }),
    ];

    const result = filterTeamMiraiVideos(videos);
    expect(result).toHaveLength(0);
  });

  it("should return empty array for empty input", () => {
    const result = filterTeamMiraiVideos([]);
    expect(result).toHaveLength(0);
  });

  it("should handle videos with undefined description and title", () => {
    const videos = [
      makeVideo({ video_description: undefined, title: undefined }),
    ];

    const result = filterTeamMiraiVideos(videos);
    expect(result).toHaveLength(0);
  });

  it("should match when both description and title contain the hashtag", () => {
    const videos = [
      makeVideo({
        video_description: "#チームみらい",
        title: "#チームみらい",
      }),
    ];

    const result = filterTeamMiraiVideos(videos);
    expect(result).toHaveLength(1);
  });
});

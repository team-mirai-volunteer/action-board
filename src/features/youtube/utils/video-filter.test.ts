import type { YouTubeVideoDetail } from "../services/youtube-client";
import { filterTeamMiraiVideos, TEAM_MIRAI_REGEX } from "./video-filter";

const createVideo = (
  overrides: Partial<{
    title: string;
    description: string;
    tags: string[];
  }> = {},
): YouTubeVideoDetail => ({
  id: "video-1",
  snippet: {
    publishedAt: "2025-01-01T00:00:00Z",
    channelId: "channel-1",
    channelTitle: "test channel",
    title: overrides.title ?? "普通の動画",
    description: overrides.description ?? "普通の説明",
    thumbnails: {},
    tags: overrides.tags,
  },
  contentDetails: { duration: "PT10M" },
  statistics: {},
});

describe("TEAM_MIRAI_REGEX", () => {
  it("#チームみらい にマッチする", () => {
    expect(TEAM_MIRAI_REGEX.test("#チームみらい")).toBe(true);
  });

  it("#teammirai にマッチする", () => {
    expect(TEAM_MIRAI_REGEX.test("#teammirai")).toBe(true);
  });

  it("#TeamMirai (大文字混在)にマッチする", () => {
    expect(TEAM_MIRAI_REGEX.test("#TeamMirai")).toBe(true);
  });

  it("ハッシュタグなしの場合マッチしない", () => {
    expect(TEAM_MIRAI_REGEX.test("チームみらい")).toBe(false);
  });
});

describe("filterTeamMiraiVideos", () => {
  it("説明文に#チームみらいを含む動画をフィルタする", () => {
    const videos = [
      createVideo({ description: "活動報告 #チームみらい" }),
      createVideo({ description: "関係ない動画" }),
    ];
    const result = filterTeamMiraiVideos(videos);
    expect(result).toHaveLength(1);
    expect(result[0].snippet.description).toBe("活動報告 #チームみらい");
  });

  it("タイトルに#チームみらいを含む動画をフィルタする", () => {
    const videos = [
      createVideo({ title: "#チームみらい 活動報告" }),
      createVideo({ title: "無関係" }),
    ];
    const result = filterTeamMiraiVideos(videos);
    expect(result).toHaveLength(1);
    expect(result[0].snippet.title).toBe("#チームみらい 活動報告");
  });

  it("タグに#チームみらいを含む動画をフィルタする", () => {
    const videos = [
      createVideo({ tags: ["#チームみらい", "政治"] }),
      createVideo({ tags: ["関係ない"] }),
    ];
    const result = filterTeamMiraiVideos(videos);
    expect(result).toHaveLength(1);
  });

  it("タグに#teammirai(大小文字無視)を含む動画をフィルタする", () => {
    const videos = [createVideo({ tags: ["#TeamMirai"] })];
    const result = filterTeamMiraiVideos(videos);
    expect(result).toHaveLength(1);
  });

  it("マッチする動画がない場合は空配列を返す", () => {
    const videos = [
      createVideo({ title: "無関係", description: "無関係", tags: ["無関係"] }),
    ];
    const result = filterTeamMiraiVideos(videos);
    expect(result).toHaveLength(0);
  });

  it("空配列を渡した場合は空配列を返す", () => {
    const result = filterTeamMiraiVideos([]);
    expect(result).toHaveLength(0);
  });

  it("タイトル、説明文、タグの複数でマッチしても重複しない", () => {
    const videos = [
      createVideo({
        title: "#チームみらい",
        description: "#チームみらい 説明",
        tags: ["#チームみらい"],
      }),
    ];
    const result = filterTeamMiraiVideos(videos);
    expect(result).toHaveLength(1);
  });
});

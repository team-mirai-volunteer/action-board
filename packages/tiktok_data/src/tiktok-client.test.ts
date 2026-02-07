import {
  extractHashtags,
  filterTeamMiraiVideos,
  isRetryableVideoListError,
  parseApiErrorResponse,
  TikTokAPIError,
} from "./tiktok-client";
import type { TikTokVideoFromAPI } from "./types";

function makeVideo(
  overrides: Partial<TikTokVideoFromAPI> = {},
): TikTokVideoFromAPI {
  return {
    id: "1",
    create_time: 1700000000,
    share_url: "https://tiktok.com/v/1",
    duration: 30,
    ...overrides,
  };
}

describe("filterTeamMiraiVideos", () => {
  test("matches #チームみらい in video_description", () => {
    const videos = [
      makeVideo({ video_description: "今日の活動 #チームみらい" }),
      makeVideo({ video_description: "普通の動画" }),
    ];
    expect(filterTeamMiraiVideos(videos)).toHaveLength(1);
    expect(filterTeamMiraiVideos(videos)[0].video_description).toBe(
      "今日の活動 #チームみらい",
    );
  });

  test("matches #teammirai in video_description (case insensitive)", () => {
    const videos = [makeVideo({ video_description: "Check out #TeamMirai" })];
    expect(filterTeamMiraiVideos(videos)).toHaveLength(1);
  });

  test("matches #チームみらい in title", () => {
    const videos = [makeVideo({ title: "#チームみらい 活動報告" })];
    expect(filterTeamMiraiVideos(videos)).toHaveLength(1);
  });

  test("matches #teammirai in title (case insensitive)", () => {
    const videos = [makeVideo({ title: "#TEAMMIRAI video" })];
    expect(filterTeamMiraiVideos(videos)).toHaveLength(1);
  });

  test("returns empty array when no videos match", () => {
    const videos = [
      makeVideo({ video_description: "無関係な動画", title: "タイトル" }),
    ];
    expect(filterTeamMiraiVideos(videos)).toHaveLength(0);
  });

  test("handles videos with undefined description and title", () => {
    const videos = [makeVideo({})];
    expect(filterTeamMiraiVideos(videos)).toHaveLength(0);
  });

  test("returns empty array for empty input", () => {
    expect(filterTeamMiraiVideos([])).toHaveLength(0);
  });

  test("matches when both description and title contain the hashtag", () => {
    const videos = [
      makeVideo({
        video_description: "#チームみらい",
        title: "#チームみらい",
      }),
    ];
    expect(filterTeamMiraiVideos(videos)).toHaveLength(1);
  });
});

describe("extractHashtags", () => {
  test("extracts single hashtag", () => {
    expect(extractHashtags("#チームみらい")).toEqual(["#チームみらい"]);
  });

  test("extracts multiple hashtags", () => {
    expect(extractHashtags("#チームみらい #政治 #活動")).toEqual([
      "#チームみらい",
      "#政治",
      "#活動",
    ]);
  });

  test("extracts hashtags with alphanumeric characters", () => {
    expect(extractHashtags("#teammirai #test123")).toEqual([
      "#teammirai",
      "#test123",
    ]);
  });

  test("extracts hashtags mixed with regular text", () => {
    expect(extractHashtags("今日は #チームみらい の活動です")).toEqual([
      "#チームみらい",
    ]);
  });

  test("returns empty array when no hashtags", () => {
    expect(extractHashtags("ハッシュタグなしのテキスト")).toEqual([]);
  });

  test("returns empty array for empty string", () => {
    expect(extractHashtags("")).toEqual([]);
  });

  test("handles kanji hashtags", () => {
    expect(extractHashtags("#政治資金")).toEqual(["#政治資金"]);
  });

  test("handles katakana hashtags", () => {
    expect(extractHashtags("#テスト")).toEqual(["#テスト"]);
  });

  test("handles hiragana hashtags", () => {
    expect(extractHashtags("#てすと")).toEqual(["#てすと"]);
  });
});

describe("isRetryableVideoListError", () => {
  test("returns true for internal_error", () => {
    expect(isRetryableVideoListError("internal_error")).toBe(true);
  });

  test("returns false for other error codes", () => {
    expect(isRetryableVideoListError("access_token_invalid")).toBe(false);
  });

  test("returns false for undefined code", () => {
    expect(isRetryableVideoListError(undefined)).toBe(false);
  });

  test("returns false for empty string", () => {
    expect(isRetryableVideoListError("")).toBe(false);
  });
});

describe("parseApiErrorResponse", () => {
  test("parses valid error JSON", () => {
    const errorText = JSON.stringify({
      error: {
        code: "internal_error",
        message: "Internal server error",
        log_id: "log-123",
      },
    });
    expect(parseApiErrorResponse(errorText)).toEqual({
      code: "internal_error",
      message: "Internal server error",
      logId: "log-123",
    });
  });

  test("returns empty object for invalid JSON", () => {
    expect(parseApiErrorResponse("not json")).toEqual({});
  });

  test("returns partial data when error fields are missing", () => {
    const errorText = JSON.stringify({ error: { code: "some_error" } });
    expect(parseApiErrorResponse(errorText)).toEqual({
      code: "some_error",
      message: undefined,
      logId: undefined,
    });
  });

  test("returns empty object when error key is missing", () => {
    const errorText = JSON.stringify({ data: "something" });
    expect(parseApiErrorResponse(errorText)).toEqual({
      code: undefined,
      message: undefined,
      logId: undefined,
    });
  });
});

describe("TikTokAPIError", () => {
  test("creates error with message only", () => {
    const error = new TikTokAPIError("テストエラー");
    expect(error.message).toBe("テストエラー");
    expect(error.name).toBe("TikTokAPIError");
    expect(error.code).toBeUndefined();
    expect(error.logId).toBeUndefined();
  });

  test("creates error with all fields", () => {
    const error = new TikTokAPIError("テストエラー", "internal_error", "log-1");
    expect(error.message).toBe("テストエラー");
    expect(error.code).toBe("internal_error");
    expect(error.logId).toBe("log-1");
  });

  test("is an instance of Error", () => {
    const error = new TikTokAPIError("テスト");
    expect(error).toBeInstanceOf(Error);
  });
});

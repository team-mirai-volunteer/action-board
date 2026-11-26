jest.mock("server-only", () => ({}));
jest.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));
jest.mock("@/lib/supabase/adminClient", () => ({
  createAdminClient: jest.fn(),
}));

import { createAdminClient } from "@/lib/supabase/adminClient";
import { getJstRecentDates } from "@/lib/utils/date-utils";
import {
  getOverallStatsHistory,
  getVideoCountByDate,
  getYouTubeStatsSummary,
  getYouTubeVideoCount,
  getYouTubeVideosWithStats,
} from "./youtube-stats-service";

const mockCreateAdminClient = createAdminClient as jest.MockedFunction<
  typeof createAdminClient
>;

function mockClient(rpc: jest.Mock, from?: jest.Mock) {
  mockCreateAdminClient.mockResolvedValue({
    rpc,
    from: from ?? jest.fn(),
  } as never);
}

describe("getYouTubeStatsSummary", () => {
  test("公開日の半開区間を RPC に渡し、集計行を表示用の形にする", async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          total_videos: "6",
          total_views: "550",
          total_likes: 13,
          total_comments: 5,
          daily_views_increase: 290,
          daily_videos_increase: 0,
        },
      ],
      error: null,
    });
    mockClient(rpc);

    const start = new Date("2026-01-01T00:00:00.000Z");
    const end = new Date("2026-03-01T10:00:00.000Z");
    const expectedTo = new Date(end);
    expectedTo.setDate(expectedTo.getDate() + 1);

    const summary = await getYouTubeStatsSummary(start, end);

    expect(rpc).toHaveBeenCalledWith("get_youtube_stats_summary", {
      published_from: start.toISOString(),
      published_to: expectedTo.toISOString(),
    });
    expect(summary).toEqual({
      totalVideos: 6,
      totalViews: 550,
      totalLikes: 13,
      totalComments: 5,
      dailyViewsIncrease: 290,
      dailyVideosIncrease: 0,
    });
  });

  test("失敗したらゼロを返す", async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: null,
      error: { message: "boom" },
    });
    mockClient(rpc);

    await expect(getYouTubeStatsSummary()).resolves.toEqual({
      totalVideos: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
    });
  });
});

describe("getOverallStatsHistory", () => {
  test("日別合計を返し、本日（JST）は除外する", async () => {
    const { today, yesterday } = getJstRecentDates();
    const rpc = jest.fn().mockResolvedValue({
      data: [
        { date: yesterday, total_views: "5", total_likes: 1 },
        { date: today, total_views: 9, total_likes: 2 },
      ],
      error: null,
    });
    mockClient(rpc);

    await expect(getOverallStatsHistory()).resolves.toEqual([
      { date: yesterday, total_views: 5, total_likes: 1 },
    ]);
  });
});

describe("getVideoCountByDate", () => {
  test("DB の日別件数を使い、0 件の日も埋める", async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        { date: "2026-01-01", count: 2 },
        { date: "2026-01-03", count: "1" },
      ],
      error: null,
    });
    mockClient(rpc);

    const result = await getVideoCountByDate(
      new Date("2026-01-01T00:00:00.000Z"),
      new Date("2026-01-03T00:00:00.000Z"),
    );

    expect(result).toEqual([
      { date: "2026-01-01", count: 2 },
      { date: "2026-01-02", count: 0 },
      { date: "2026-01-03", count: 1 },
    ]);
  });
});

describe("getYouTubeVideosWithStats", () => {
  test("ソートとページングを RPC に渡す", async () => {
    const rpc = jest.fn().mockResolvedValue({ data: [], error: null });
    mockClient(rpc);

    await getYouTubeVideosWithStats(40, 80, "view_count");

    expect(rpc).toHaveBeenCalledWith("get_youtube_videos_with_latest_stats", {
      published_from: undefined,
      published_to: undefined,
      sort_by: "view_count",
      result_limit: 40,
      result_offset: 80,
    });
  });
});

describe("getYouTubeVideoCount", () => {
  test("件数ヘッダだけを読む", async () => {
    const query: Record<string, unknown> = {};
    const chain = () => query;
    query.eq = jest.fn(chain);
    query.gte = jest.fn(chain);
    query.lt = jest.fn(chain);
    query.then = (resolve: (value: { count: number; error: null }) => void) =>
      Promise.resolve({ count: 7, error: null }).then(resolve);

    const from = jest.fn().mockReturnValue({
      select: () => query,
    });
    mockClient(jest.fn(), from);

    const start = new Date("2026-01-01T00:00:00.000Z");
    await expect(getYouTubeVideoCount(start)).resolves.toBe(7);
    expect(query.gte).toHaveBeenCalledWith(
      "published_at",
      "2026-01-01T00:00:00.000Z",
    );
  });
});

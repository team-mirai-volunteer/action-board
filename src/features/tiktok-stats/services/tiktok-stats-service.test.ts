jest.mock("server-only", () => ({}));
jest.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));
jest.mock("@/lib/supabase/adminClient", () => ({
  createAdminClient: jest.fn(),
}));

import { createAdminClient } from "@/lib/supabase/adminClient";
import {
  getTikTokStatsSummary,
  getTikTokVideosWithStats,
} from "./tiktok-stats-service";

const mockCreateAdminClient = createAdminClient as jest.MockedFunction<
  typeof createAdminClient
>;

describe("getTikTokStatsSummary", () => {
  test("シェアを含む集計行を表示用の形にする", async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          total_videos: 2,
          total_views: 300,
          total_likes: 8,
          total_comments: 1,
          total_shares: "4",
          daily_views_increase: 120,
          daily_videos_increase: 1,
        },
      ],
      error: null,
    });
    mockCreateAdminClient.mockResolvedValue({ rpc } as never);

    await expect(getTikTokStatsSummary()).resolves.toEqual({
      totalVideos: 2,
      totalViews: 300,
      totalLikes: 8,
      totalComments: 1,
      totalShares: 4,
      dailyViewsIncrease: 120,
      dailyVideosIncrease: 1,
    });
    expect(rpc).toHaveBeenCalledWith("get_tiktok_stats_summary", {
      published_from: undefined,
      published_to: undefined,
    });
  });

  test("失敗したらゼロを返す", async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: null,
      error: { message: "boom" },
    });
    mockCreateAdminClient.mockResolvedValue({ rpc } as never);

    await expect(getTikTokStatsSummary()).resolves.toEqual({
      totalVideos: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
    });
  });
});

describe("getTikTokVideosWithStats", () => {
  test("最新統計だけをページ単位で受け取る", async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [{ video_id: "v1", latest_view_count: 10 }],
      error: null,
    });
    mockCreateAdminClient.mockResolvedValue({ rpc } as never);

    const videos = await getTikTokVideosWithStats(40, 0, "like_count");
    expect(videos).toHaveLength(1);
    expect(videos[0]?.latest_view_count).toBe(10);
    expect(rpc).toHaveBeenCalledWith("get_tiktok_videos_with_latest_stats", {
      published_from: undefined,
      published_to: undefined,
      sort_by: "like_count",
      result_limit: 40,
      result_offset: 0,
    });
  });
});

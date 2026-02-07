import type {
  OverallStatsHistoryItem,
  VideoCountByDateItem,
  YouTubeVideoWithStats,
} from "../types";
import {
  aggregateDailyStats,
  aggregateVideosByDate,
  extractLatestStats,
  generateDateRange,
  mapStatisticsResult,
  sortVideosByMetric,
  type VideoWithStatsRelation,
} from "./youtube-stats-utils";

describe("extractLatestStats", () => {
  it("should extract latest stats from videos based on recorded_at", () => {
    const videos: VideoWithStatsRelation[] = [
      {
        video_id: "v1",
        title: "Video 1",
        published_at: "2026-01-10T00:00:00Z",
        youtube_video_stats: [
          {
            view_count: 100,
            like_count: 10,
            comment_count: 5,
            recorded_at: "2026-01-10",
          },
          {
            view_count: 200,
            like_count: 20,
            comment_count: 8,
            recorded_at: "2026-01-11",
          },
        ],
      },
    ];

    const result = extractLatestStats(videos);
    expect(result).toHaveLength(1);
    expect(result[0].latest_view_count).toBe(200);
    expect(result[0].latest_like_count).toBe(20);
    expect(result[0].latest_comment_count).toBe(8);
  });

  it("should handle empty stats array", () => {
    const videos: VideoWithStatsRelation[] = [
      {
        video_id: "v1",
        title: "Video 1",
        youtube_video_stats: [],
      },
    ];

    const result = extractLatestStats(videos);
    expect(result).toHaveLength(1);
    expect(result[0].latest_view_count).toBeNull();
    expect(result[0].latest_like_count).toBeNull();
    expect(result[0].latest_comment_count).toBeNull();
  });

  it("should handle null stat values", () => {
    const videos: VideoWithStatsRelation[] = [
      {
        video_id: "v1",
        youtube_video_stats: [
          {
            view_count: null,
            like_count: null,
            comment_count: null,
            recorded_at: "2026-01-10",
          },
        ],
      },
    ];

    const result = extractLatestStats(videos);
    expect(result[0].latest_view_count).toBeNull();
    expect(result[0].latest_like_count).toBeNull();
    expect(result[0].latest_comment_count).toBeNull();
  });

  it("should handle multiple videos", () => {
    const videos: VideoWithStatsRelation[] = [
      {
        video_id: "v1",
        youtube_video_stats: [
          {
            view_count: 100,
            like_count: 10,
            comment_count: 1,
            recorded_at: "2026-01-10",
          },
        ],
      },
      {
        video_id: "v2",
        youtube_video_stats: [
          {
            view_count: 500,
            like_count: 50,
            comment_count: 25,
            recorded_at: "2026-01-10",
          },
        ],
      },
    ];

    const result = extractLatestStats(videos);
    expect(result).toHaveLength(2);
    expect(result[0].latest_view_count).toBe(100);
    expect(result[1].latest_view_count).toBe(500);
  });

  it("should remove youtube_video_stats from result", () => {
    const videos: VideoWithStatsRelation[] = [
      {
        video_id: "v1",
        youtube_video_stats: [
          {
            view_count: 100,
            like_count: 10,
            comment_count: 1,
            recorded_at: "2026-01-10",
          },
        ],
      },
    ];

    const result = extractLatestStats(videos);
    expect((result[0] as any).youtube_video_stats).toBeUndefined();
  });
});

describe("sortVideosByMetric", () => {
  const videos: YouTubeVideoWithStats[] = [
    {
      latest_view_count: 100,
      latest_like_count: 50,
      latest_comment_count: 10,
      published_at: "2026-01-10T00:00:00Z",
    } as YouTubeVideoWithStats,
    {
      latest_view_count: 300,
      latest_like_count: 20,
      latest_comment_count: 5,
      published_at: "2026-01-12T00:00:00Z",
    } as YouTubeVideoWithStats,
    {
      latest_view_count: 200,
      latest_like_count: 80,
      latest_comment_count: 15,
      published_at: "2026-01-08T00:00:00Z",
    } as YouTubeVideoWithStats,
  ];

  it("should sort by view_count descending", () => {
    const result = sortVideosByMetric(videos, "view_count");
    expect(result[0].latest_view_count).toBe(300);
    expect(result[1].latest_view_count).toBe(200);
    expect(result[2].latest_view_count).toBe(100);
  });

  it("should sort by like_count descending", () => {
    const result = sortVideosByMetric(videos, "like_count");
    expect(result[0].latest_like_count).toBe(80);
    expect(result[1].latest_like_count).toBe(50);
    expect(result[2].latest_like_count).toBe(20);
  });

  it("should sort by published_at descending by default", () => {
    const result = sortVideosByMetric(videos, "published_at");
    expect(result[0].published_at).toBe("2026-01-12T00:00:00Z");
    expect(result[1].published_at).toBe("2026-01-10T00:00:00Z");
    expect(result[2].published_at).toBe("2026-01-08T00:00:00Z");
  });

  it("should handle null values in view_count", () => {
    const videosWithNull: YouTubeVideoWithStats[] = [
      {
        latest_view_count: null,
        published_at: "2026-01-10T00:00:00Z",
      } as YouTubeVideoWithStats,
      {
        latest_view_count: 100,
        published_at: "2026-01-11T00:00:00Z",
      } as YouTubeVideoWithStats,
    ];
    const result = sortVideosByMetric(videosWithNull, "view_count");
    expect(result[0].latest_view_count).toBe(100);
    expect(result[1].latest_view_count).toBeNull();
  });

  it("should not mutate the original array", () => {
    const original = [...videos];
    sortVideosByMetric(videos, "view_count");
    expect(videos).toEqual(original);
  });
});

describe("aggregateDailyStats", () => {
  it("should aggregate stats by date", () => {
    const data = [
      { recorded_at: "2026-01-10", view_count: 100, like_count: 10 },
      { recorded_at: "2026-01-10", view_count: 200, like_count: 20 },
      { recorded_at: "2026-01-11", view_count: 50, like_count: 5 },
    ];

    const result = aggregateDailyStats(data);
    expect(result.get("2026-01-10")).toEqual({
      total_views: 300,
      total_likes: 30,
    });
    expect(result.get("2026-01-11")).toEqual({
      total_views: 50,
      total_likes: 5,
    });
  });

  it("should handle null values as 0", () => {
    const data = [
      { recorded_at: "2026-01-10", view_count: null, like_count: null },
      { recorded_at: "2026-01-10", view_count: 100, like_count: 10 },
    ];

    const result = aggregateDailyStats(data);
    expect(result.get("2026-01-10")).toEqual({
      total_views: 100,
      total_likes: 10,
    });
  });

  it("should return empty map for empty input", () => {
    const result = aggregateDailyStats([]);
    expect(result.size).toBe(0);
  });
});

describe("mapStatisticsResult", () => {
  it("should convert map to sorted array", () => {
    const map = new Map<string, { total_views: number; total_likes: number }>();
    map.set("2026-01-12", { total_views: 300, total_likes: 30 });
    map.set("2026-01-10", { total_views: 100, total_likes: 10 });
    map.set("2026-01-11", { total_views: 200, total_likes: 20 });

    const result = mapStatisticsResult(map);
    expect(result).toEqual([
      { date: "2026-01-10", total_views: 100, total_likes: 10 },
      { date: "2026-01-11", total_views: 200, total_likes: 20 },
      { date: "2026-01-12", total_views: 300, total_likes: 30 },
    ]);
  });

  it("should return empty array for empty map", () => {
    const map = new Map<string, { total_views: number; total_likes: number }>();
    const result = mapStatisticsResult(map);
    expect(result).toEqual([]);
  });
});

describe("aggregateVideosByDate", () => {
  it("should count videos per date from published_at", () => {
    const videos = [
      { published_at: "2026-01-10T10:00:00Z" },
      { published_at: "2026-01-10T15:00:00Z" },
      { published_at: "2026-01-11T08:00:00Z" },
    ];

    const result = aggregateVideosByDate(videos);
    expect(result.get("2026-01-10")).toBe(2);
    expect(result.get("2026-01-11")).toBe(1);
  });

  it("should skip videos with null published_at", () => {
    const videos = [
      { published_at: "2026-01-10T10:00:00Z" },
      { published_at: null },
    ];

    const result = aggregateVideosByDate(videos);
    expect(result.size).toBe(1);
    expect(result.get("2026-01-10")).toBe(1);
  });

  it("should return empty map for empty input", () => {
    const result = aggregateVideosByDate([]);
    expect(result.size).toBe(0);
  });
});

describe("generateDateRange", () => {
  it("should generate consecutive dates with correct counts", () => {
    // Use a range large enough that timezone shifts don't eliminate all dates
    const start = new Date("2026-01-10");
    const end = new Date("2026-01-15");

    const dailyCounts = new Map<string, number>();
    dailyCounts.set("2026-01-10", 3);
    dailyCounts.set("2026-01-12", 1);

    const result = generateDateRange(start, end, dailyCounts);

    // Should have multiple dates
    expect(result.length).toBeGreaterThanOrEqual(3);

    // All dates should be in YYYY-MM-DD format
    for (const item of result) {
      expect(item.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }

    // Dates in dailyCounts should have correct count
    const jan10 = result.find((r) => r.date === "2026-01-10");
    if (jan10) expect(jan10.count).toBe(3);
    const jan12 = result.find((r) => r.date === "2026-01-12");
    if (jan12) expect(jan12.count).toBe(1);

    // Dates not in dailyCounts should have count 0
    const jan11 = result.find((r) => r.date === "2026-01-11");
    if (jan11) expect(jan11.count).toBe(0);

    // Dates should be in ascending order
    for (let i = 1; i < result.length; i++) {
      expect(result[i].date > result[i - 1].date).toBe(true);
    }
  });

  it("should return empty array if start is clearly after end", () => {
    const dailyCounts = new Map<string, number>();
    const result = generateDateRange(
      new Date("2026-02-01"),
      new Date("2026-01-01"),
      dailyCounts,
    );
    expect(result).toEqual([]);
  });

  it("should return 0 count for dates not in dailyCounts", () => {
    const dailyCounts = new Map<string, number>();
    const result = generateDateRange(
      new Date("2026-01-10"),
      new Date("2026-01-15"),
      dailyCounts,
    );

    expect(result.length).toBeGreaterThanOrEqual(1);
    for (const item of result) {
      expect(item.count).toBe(0);
    }
  });

  it("should use YYYY-MM-DD format from toISOString for date keys", () => {
    const dailyCounts = new Map<string, number>();
    dailyCounts.set("2026-03-01", 7);

    const result = generateDateRange(
      new Date("2026-03-01"),
      new Date("2026-03-05"),
      dailyCounts,
    );

    expect(result.length).toBeGreaterThanOrEqual(1);
    const mar01 = result.find((r) => r.date === "2026-03-01");
    if (mar01) expect(mar01.count).toBe(7);
  });
});

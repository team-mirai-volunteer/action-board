import type { TikTokVideoWithStats } from "../types";
import {
  aggregateDailyStats,
  countVideosByDate,
  generateDateRange,
  getLatestStats,
  mapVideoToWithStats,
  type StatsRecord,
} from "./stats-utils";

describe("stats-utils", () => {
  describe("getLatestStats", () => {
    describe("空配列", () => {
      it("undefinedを返す", () => {
        const result = getLatestStats([]);
        expect(result).toBeUndefined();
      });
    });

    describe("1件", () => {
      it("その1件を返す", () => {
        const stats = [{ recorded_at: "2025-01-15", value: 100 }];
        const result = getLatestStats(stats);
        expect(result).toEqual({ recorded_at: "2025-01-15", value: 100 });
      });
    });

    describe("複数件", () => {
      it("最新のrecorded_atを持つレコードを返す", () => {
        const stats = [
          { recorded_at: "2025-01-13", value: 100 },
          { recorded_at: "2025-01-15", value: 300 },
          { recorded_at: "2025-01-14", value: 200 },
        ];
        const result = getLatestStats(stats);
        expect(result).toEqual({ recorded_at: "2025-01-15", value: 300 });
      });
    });

    describe("同日レコード", () => {
      it("同日のレコードがあっても1件を返す", () => {
        const stats = [
          { recorded_at: "2025-01-15", value: 100 },
          { recorded_at: "2025-01-15", value: 200 },
        ];
        const result = getLatestStats(stats);
        expect(result).toBeDefined();
        expect(result?.recorded_at).toBe("2025-01-15");
      });
    });
  });

  describe("mapVideoToWithStats", () => {
    describe("統計あり", () => {
      it("最新統計が正しくマッピングされる", () => {
        const video = {
          id: "video_001",
          video_id: "v001",
          published_at: "2025-01-15T00:00:00Z",
          is_active: true,
          tiktok_video_stats: [
            {
              view_count: 100,
              like_count: 10,
              comment_count: 5,
              share_count: 2,
              recorded_at: "2025-01-14",
            },
            {
              view_count: 200,
              like_count: 20,
              comment_count: 8,
              share_count: 3,
              recorded_at: "2025-01-15",
            },
          ] as StatsRecord[],
        };

        const result = mapVideoToWithStats(
          video as unknown as Record<string, unknown> & {
            tiktok_video_stats: StatsRecord[];
          },
        );

        expect(result.latest_view_count).toBe(200);
        expect(result.latest_like_count).toBe(20);
        expect(result.latest_comment_count).toBe(8);
        expect(result.latest_share_count).toBe(3);
      });
    });

    describe("統計なし（空配列）", () => {
      it("全統計がnullになる", () => {
        const video = {
          id: "video_002",
          video_id: "v002",
          published_at: "2025-01-15T00:00:00Z",
          is_active: true,
          tiktok_video_stats: [] as StatsRecord[],
        };

        const result = mapVideoToWithStats(
          video as unknown as Record<string, unknown> & {
            tiktok_video_stats: StatsRecord[];
          },
        );

        expect(result.latest_view_count).toBeNull();
        expect(result.latest_like_count).toBeNull();
        expect(result.latest_comment_count).toBeNull();
        expect(result.latest_share_count).toBeNull();
      });
    });

    describe("null値処理", () => {
      it("統計値がnullの場合nullが維持される", () => {
        const video = {
          id: "video_003",
          video_id: "v003",
          published_at: "2025-01-15T00:00:00Z",
          is_active: true,
          tiktok_video_stats: [
            {
              view_count: null,
              like_count: null,
              comment_count: null,
              share_count: null,
              recorded_at: "2025-01-15",
            },
          ] as StatsRecord[],
        };

        const result = mapVideoToWithStats(
          video as unknown as Record<string, unknown> & {
            tiktok_video_stats: StatsRecord[];
          },
        );

        expect(result.latest_view_count).toBeNull();
        expect(result.latest_like_count).toBeNull();
        expect(result.latest_comment_count).toBeNull();
        expect(result.latest_share_count).toBeNull();
      });
    });
  });

  describe("aggregateDailyStats", () => {
    describe("空配列", () => {
      it("空のMapを返す", () => {
        const result = aggregateDailyStats([]);
        expect(result.size).toBe(0);
      });
    });

    describe("1日分", () => {
      it("1日分の統計が正しく集計される", () => {
        const data = [
          { recorded_at: "2025-01-15", view_count: 100, like_count: 10 },
        ];
        const result = aggregateDailyStats(data);
        expect(result.get("2025-01-15")).toEqual({
          total_views: 100,
          total_likes: 10,
        });
      });
    });

    describe("複数日", () => {
      it("日付ごとに正しく集計される", () => {
        const data = [
          { recorded_at: "2025-01-15", view_count: 100, like_count: 10 },
          { recorded_at: "2025-01-16", view_count: 200, like_count: 20 },
        ];
        const result = aggregateDailyStats(data);
        expect(result.size).toBe(2);
        expect(result.get("2025-01-15")).toEqual({
          total_views: 100,
          total_likes: 10,
        });
        expect(result.get("2025-01-16")).toEqual({
          total_views: 200,
          total_likes: 20,
        });
      });
    });

    describe("null値", () => {
      it("null値は0として扱われる", () => {
        const data = [
          { recorded_at: "2025-01-15", view_count: null, like_count: null },
          { recorded_at: "2025-01-15", view_count: 100, like_count: null },
        ];
        const result = aggregateDailyStats(data);
        expect(result.get("2025-01-15")).toEqual({
          total_views: 100,
          total_likes: 0,
        });
      });
    });

    describe("同日複数レコード", () => {
      it("同日のレコードが合計される", () => {
        const data = [
          { recorded_at: "2025-01-15", view_count: 100, like_count: 10 },
          { recorded_at: "2025-01-15", view_count: 200, like_count: 20 },
          { recorded_at: "2025-01-15", view_count: 50, like_count: 5 },
        ];
        const result = aggregateDailyStats(data);
        expect(result.get("2025-01-15")).toEqual({
          total_views: 350,
          total_likes: 35,
        });
      });
    });
  });

  describe("countVideosByDate", () => {
    describe("空配列", () => {
      it("空のMapを返す", () => {
        const result = countVideosByDate([]);
        expect(result.size).toBe(0);
      });
    });

    describe("null含む", () => {
      it("nullはスキップされる", () => {
        const result = countVideosByDate([null, "2025-01-15T10:00:00Z", null]);
        expect(result.size).toBe(1);
        expect(result.get("2025-01-15")).toBe(1);
      });
    });

    describe("同日複数", () => {
      it("同じ日付のカウントが加算される", () => {
        const result = countVideosByDate([
          "2025-01-15T10:00:00Z",
          "2025-01-15T14:00:00Z",
          "2025-01-15T18:00:00Z",
        ]);
        expect(result.get("2025-01-15")).toBe(3);
      });
    });

    describe("複数日", () => {
      it("日付ごとに正しくカウントされる", () => {
        const result = countVideosByDate([
          "2025-01-15T10:00:00Z",
          "2025-01-16T10:00:00Z",
          "2025-01-15T14:00:00Z",
          "2025-01-17T10:00:00Z",
        ]);
        expect(result.size).toBe(3);
        expect(result.get("2025-01-15")).toBe(2);
        expect(result.get("2025-01-16")).toBe(1);
        expect(result.get("2025-01-17")).toBe(1);
      });
    });
  });

  describe("generateDateRange", () => {
    describe("1日", () => {
      it("1日分の結果を返す", () => {
        const start = new Date(2025, 0, 15);
        const end = new Date(2025, 0, 15);
        // dateStrはtoISOString().split("T")[0]で生成されるのでUTC日付を使う
        const startDateStr = start.toISOString().split("T")[0];
        const dailyCount = new Map([[startDateStr, 3]]);

        const result = generateDateRange(start, end, dailyCount);

        expect(result).toHaveLength(1);
        expect(result[0].count).toBe(3);
        expect(result[0].date).toBe(startDateStr);
      });
    });

    describe("複数日", () => {
      it("開始日から終了日までの全日付が含まれる", () => {
        const start = new Date(2025, 0, 15);
        const end = new Date(2025, 0, 17);
        const day1 = new Date(2025, 0, 15).toISOString().split("T")[0];
        const day3 = new Date(2025, 0, 17).toISOString().split("T")[0];
        const dailyCount = new Map([
          [day1, 1],
          [day3, 2],
        ]);

        const result = generateDateRange(start, end, dailyCount);

        expect(result).toHaveLength(3);
        expect(result[0].count).toBe(1);
        expect(result[1].count).toBe(0);
        expect(result[2].count).toBe(2);
      });
    });

    describe("カウント0の日の補完", () => {
      it("データがない日はcount:0で埋められる", () => {
        const start = new Date(2025, 0, 15);
        const end = new Date(2025, 0, 18);
        const dailyCount = new Map<string, number>();

        const result = generateDateRange(start, end, dailyCount);

        expect(result).toHaveLength(4);
        for (const item of result) {
          expect(item.count).toBe(0);
        }
      });
    });

    describe("開始=終了", () => {
      it("1日分の結果を返す", () => {
        const start = new Date(2025, 0, 15);
        const end = new Date(2025, 0, 15);
        const dateStr = start.toISOString().split("T")[0];
        const dailyCount = new Map([[dateStr, 5]]);

        const result = generateDateRange(start, end, dailyCount);

        expect(result).toHaveLength(1);
        expect(result[0].count).toBe(5);
      });
    });
  });
});

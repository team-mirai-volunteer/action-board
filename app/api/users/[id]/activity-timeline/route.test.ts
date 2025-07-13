import { getUserActivityTimeline } from "@/lib/services/activityTimeline";
import { NextRequest } from "next/server";
/**
 * @jest-environment node
 */
import { GET } from "./route";

jest.mock("@/lib/services/activityTimeline");
const mockGetUserActivityTimeline =
  getUserActivityTimeline as jest.MockedFunction<
    typeof getUserActivityTimeline
  >;

describe("/api/users/[id]/activity-timeline", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("正常系: クエリパラメータを解析してレスポンスを返す", async () => {
      const mockTimeline = [
        {
          id: "test-1",
          user_id: "user-123",
          name: "テストユーザー",
          address_prefecture: "東京都",
          avatar_url: null,
          title: "テストアクティビティ",
          created_at: "2024-01-01T00:00:00Z",
          activity_type: "signup",
        },
      ];

      mockGetUserActivityTimeline.mockResolvedValue(mockTimeline);

      const request = new NextRequest(
        "http://localhost:3000/api/users/user-123/activity-timeline?limit=10&offset=5",
      );
      const params = { id: "user-123" };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(mockGetUserActivityTimeline).toHaveBeenCalledWith(
        "user-123",
        10,
        5,
      );
      expect(response.status).toBe(200);
      expect(data).toEqual({ timeline: mockTimeline });
    });

    it("デフォルト値が正しく適用される", async () => {
      mockGetUserActivityTimeline.mockResolvedValue([]);

      const request = new NextRequest(
        "http://localhost:3000/api/users/user-123/activity-timeline",
      );
      const params = { id: "user-123" };

      await GET(request, { params });

      expect(mockGetUserActivityTimeline).toHaveBeenCalledWith(
        "user-123",
        20,
        0,
      );
    });

    it("無効なlimit/offsetパラメータは数値変換される", async () => {
      mockGetUserActivityTimeline.mockResolvedValue([]);

      const request = new NextRequest(
        "http://localhost:3000/api/users/user-123/activity-timeline?limit=invalid&offset=abc",
      );
      const params = { id: "user-123" };

      await GET(request, { params });

      expect(mockGetUserActivityTimeline).toHaveBeenCalledWith(
        "user-123",
        20,
        0,
      );
    });

    it("エラー時は500エラーレスポンスを返す", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const error = new Error("Service error");
      mockGetUserActivityTimeline.mockRejectedValue(error);

      const request = new NextRequest(
        "http://localhost:3000/api/users/user-123/activity-timeline",
      );
      const params = { id: "user-123" };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to fetch activity timeline:",
        error,
      );
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Failed to fetch activity timeline" });

      consoleSpy.mockRestore();
    });

    it("server-only関数のプロキシとして正しく動作する", async () => {
      const mockTimeline = [
        {
          id: "proxy-test",
          user_id: "user-456",
          name: "プロキシテスト",
          address_prefecture: "神奈川県",
          avatar_url: null,
          title: "プロキシ経由アクセス",
          created_at: "2024-01-01T00:00:00Z",
          activity_type: "mission_achievement",
        },
      ];

      mockGetUserActivityTimeline.mockResolvedValue(mockTimeline);

      const request = new NextRequest(
        "http://localhost:3000/api/users/user-456/activity-timeline?limit=5",
      );
      const params = { id: "user-456" };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(mockGetUserActivityTimeline).toHaveBeenCalledWith(
        "user-456",
        5,
        0,
      );
      expect(data.timeline).toEqual(mockTimeline);
      expect(response.headers.get("content-type")).toContain(
        "application/json",
      );
    });
  });
});

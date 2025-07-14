import { render, screen } from "@testing-library/react";
import { ActivityTimeline } from "./activity-timeline";

describe("ActivityTimeline", () => {
  describe("基本的な表示", () => {
    it("アクティビティタイムラインが正しくレンダリングされる", async () => {
      const result = await ActivityTimeline({ timeline: [], hasNext: false });
      render(result);

      expect(result).toBeDefined();
    });

    it("タイムラインデータが渡された場合の処理", async () => {
      const mockTimeline = [
        {
          id: "1",
          created_at: "2023-01-01",
          title: "テストアクティビティ",
          name: "テストユーザー",
          user_id: "user-1",
          address_prefecture: "東京都",
          avatar_url: null,
          activity_type: "mission_achievement",
        },
      ];
      const result = await ActivityTimeline({
        timeline: mockTimeline,
        hasNext: true,
      });

      expect(result).toBeDefined();
    });
  });

  describe("データ取得", () => {
    it("コンポーネントが正しくレンダリングされる", async () => {
      const result = await ActivityTimeline({ timeline: [], hasNext: false });
      render(result);

      expect(result).toBeDefined();
    });
  });

  describe("エラーハンドリング", () => {
    it("データ取得エラー時の処理", async () => {
      const mockCreateClient = require("@/lib/supabase/server").createClient;
      mockCreateClient.mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() =>
                Promise.resolve({ data: null, error: { message: "エラー" } }),
              ),
            })),
          })),
        })),
      });

      const result = await ActivityTimeline({ timeline: [], hasNext: false });

      expect(result).toBeDefined();
    });
  });
});

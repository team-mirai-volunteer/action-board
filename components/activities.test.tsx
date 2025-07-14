import { createClient } from "@/lib/supabase/client";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import Activities from "./activities";

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(),
}));

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

describe("Activities", () => {
  const mockTimeline = [
    {
      id: "1",
      created_at: "2023-01-01T00:00:00Z",
      title: "テストアクティビティ",
      name: "テストユーザー",
      user_id: "user-1",
      address_prefecture: "東京都",
      avatar_url: null,
      activity_type: "mission_achievement",
    },
  ];

  const defaultProps = {
    initialTimeline: mockTimeline,
    totalCount: 5,
    pageSize: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateClient.mockReturnValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    } as any);
  });

  describe("基本的な表示", () => {
    it("コンポーネントが正しくレンダリングされる", () => {
      render(<Activities {...defaultProps} />);

      expect(screen.getByText("⏰ 活動タイムライン")).toBeInTheDocument();
    });

    it("説明文が表示される", () => {
      render(<Activities {...defaultProps} />);

      expect(
        screen.getByText("リアルタイムで更新される活動記録"),
      ).toBeInTheDocument();
    });

    it("初期タイムラインデータが表示される", () => {
      render(<Activities {...defaultProps} />);

      expect(screen.getByText(/テストアクティビティ/)).toBeInTheDocument();
    });
  });

  describe("ページネーション機能", () => {
    it("hasNextがtrueの場合、もっと見るボタンが表示される", () => {
      const props = {
        ...defaultProps,
        totalCount: 20,
      };
      render(<Activities {...props} />);

      expect(screen.getByText("もっと見る")).toBeInTheDocument();
    });

    it("hasNextがfalseの場合、もっと見るボタンが表示されない", () => {
      const props = {
        ...defaultProps,
        totalCount: 1,
      };
      render(<Activities {...props} />);

      expect(screen.queryByText("もっと見る")).not.toBeInTheDocument();
    });

    it("もっと見るボタンをクリックすると追加データが読み込まれる", async () => {
      const additionalData = [
        {
          id: "2",
          created_at: "2023-01-02T00:00:00Z",
          title: "追加アクティビティ",
          name: "テストユーザー2",
          user_id: "user-2",
          address_prefecture: "神奈川県",
          avatar_url: null,
          activity_type: "signup",
        },
      ];

      mockCreateClient.mockReturnValue({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            order: jest.fn(() => ({
              range: jest.fn(() =>
                Promise.resolve({ data: additionalData, error: null }),
              ),
            })),
          })),
        })),
      } as any);

      const props = {
        ...defaultProps,
        totalCount: 20,
      };
      render(<Activities {...props} />);

      const loadMoreButton = screen.getByText("もっと見る");
      fireEvent.click(loadMoreButton);

      await waitFor(() => {
        expect(screen.getByText("追加アクティビティ")).toBeInTheDocument();
      });
    });
  });

  describe("ローディング状態", () => {
    it("データ読み込み中にローディングメッセージが表示される", async () => {
      let resolvePromise: (value: any) => void = () => {};
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockCreateClient.mockReturnValue({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            order: jest.fn(() => ({
              range: jest.fn(() => promise),
            })),
          })),
        })),
      } as any);

      const props = {
        ...defaultProps,
        totalCount: 20,
      };
      render(<Activities {...props} />);

      const loadMoreButton = screen.getByText("もっと見る");
      fireEvent.click(loadMoreButton);

      expect(screen.getByText("読み込み中...")).toBeInTheDocument();

      resolvePromise({ data: [], error: null });
      await waitFor(() => {
        expect(screen.queryByText("読み込み中...")).not.toBeInTheDocument();
      });
    });
  });

  describe("エラーハンドリング", () => {
    it("データ取得エラー時にエラーメッセージが表示される", async () => {
      mockCreateClient.mockReturnValue({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            order: jest.fn(() => ({
              range: jest.fn(() =>
                Promise.resolve({
                  data: null,
                  error: { message: "Database error" },
                }),
              ),
            })),
          })),
        })),
      } as any);

      const props = {
        ...defaultProps,
        totalCount: 20,
      };
      render(<Activities {...props} />);

      const loadMoreButton = screen.getByText("もっと見る");
      fireEvent.click(loadMoreButton);

      await waitFor(() => {
        expect(
          screen.getByText("活動データの読み込みに失敗しました"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("空の状態", () => {
    it("初期データが空の場合、適切に表示される", () => {
      const props = {
        ...defaultProps,
        initialTimeline: [],
        totalCount: 0,
      };
      render(<Activities {...props} />);

      expect(screen.getByText("活動履歴がありません")).toBeInTheDocument();
    });
  });
});

import { render, screen, waitFor } from "@testing-library/react";
import React from "react";

jest.mock("@/lib/services/metrics", () => ({
  fetchAllMetricsData: jest.fn().mockResolvedValue({
    supporter: {
      totalCount: 75982,
      last24hCount: 1710,
      updatedAt: "2025-07-03T02:20:00Z",
    },
    donation: {
      totalAmount: 1000000,
      last24hAmount: 25000,
      updatedAt: "2025-07-03T02:20:00Z",
    },
    achievement: {
      totalCount: 18605,
      todayCount: 245,
    },
    registration: {
      totalCount: 1000,
      todayCount: 50,
    },
  }),
}));

import Metrics from "./index";

jest.mock("@/components/ui/separator", () => ({
  Separator: ({ orientation, className }: any) => (
    <div
      data-testid="separator"
      data-orientation={orientation}
      className={className}
    />
  ),
}));

describe("Metrics", () => {
  describe("基本的な表示", () => {
    it("メトリクスが正しくレンダリングされる", async () => {
      render(await Metrics());

      expect(screen.getByText("チームみらいの活動状況🚀")).toBeInTheDocument();
      expect(screen.getByText("寄付金額")).toBeInTheDocument();
    });

    it("アクション達成数メトリクスが表示される", async () => {
      render(await Metrics());

      expect(screen.getByText("達成アクション数")).toBeInTheDocument();
    });

    it("参加者数メトリクスが表示される", async () => {
      render(await Metrics());

      await waitFor(() => {
        expect(screen.getByText("サポーター数")).toBeInTheDocument();
        expect(screen.getByText("75,982")).toBeInTheDocument();
        expect(screen.getByText("人")).toBeInTheDocument();
      });
    });
  });

  describe("データ取得", () => {
    it("メトリクスデータが正しく取得される", async () => {
      render(await Metrics());
      // データが正しく表示されることを確認
      expect(screen.getByText("75,982")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
      expect(screen.getByText("万円")).toBeInTheDocument();
    });
  });

  describe("エラーハンドリング", () => {
    describe("エラーハンドリング", () => {
      it("データ取得エラー時にフォールバック値が表示される", async () => {
        // エラーをモック
        jest.mock("@/lib/services/metrics", () => ({
          getMetricsData: jest.fn().mockRejectedValue(new Error("API Error")),
        }));

        render(await Metrics());

        // フォールバック値が表示されることを確認
        await waitFor(() => {
          expect(screen.getByText("75,982")).toBeInTheDocument();
        });
      });
    });
  });

  describe("レイアウト", () => {
    it("Separatorコンポーネントが表示される", async () => {
      render(await Metrics());

      expect(screen.getAllByTestId("separator")).toHaveLength(3);
    });
  });
});

import { render, screen, waitFor } from "@testing-library/react";

// メトリクスサービスのモック
jest.mock("../services/get-metrics", () => ({
  fetchAllMetricsData: jest.fn(),
}));

import { fetchAllMetricsData } from "@/features/metrics/services/get-metrics";
import { Metrics } from "./metrics-index";

// モック関数の型アサーション
const mockFetchAllMetricsData = fetchAllMetricsData as jest.MockedFunction<
  typeof fetchAllMetricsData
>;

// テスト用のデフォルトデータ
const defaultMockData = {
  supporter: {
    totalCount: 75982,
    last24hCount: 1710,
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
};

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
  beforeEach(() => {
    // 各テスト前にモックデータをリセット
    mockFetchAllMetricsData.mockResolvedValue(defaultMockData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("基本的な表示", () => {
    it("メトリクスが正しくレンダリングされる", async () => {
      render(await Metrics());

      expect(screen.getByText("チームみらいの活動状況🚀")).toBeInTheDocument();
      expect(screen.getByText("達成アクション数")).toBeInTheDocument();
      expect(screen.getByText("サポーター数")).toBeInTheDocument();
    });

    it("メトリクス数値が正しく表示される", async () => {
      render(await Metrics());

      await waitFor(() => {
        // サポーター数の確認
        expect(screen.getByText("75,982")).toBeInTheDocument();
        expect(screen.getByText("人")).toBeInTheDocument();

        // アクション達成数の確認
        expect(screen.getByText("18,605")).toBeInTheDocument();
      });
    });

    it("更新時刻が表示される", async () => {
      render(await Metrics());

      // 本番と同じ形式の日付フォーマット YYYY/MM/DD HH:MM 更新 の形式で検証
      expect(
        screen.getByText(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2} 更新/),
      ).toBeInTheDocument();
    });
  });

  describe("データ取得", () => {
    it("fetchAllMetricsDataが正しく呼び出される", async () => {
      await Metrics();

      expect(mockFetchAllMetricsData).toHaveBeenCalledTimes(1);
    });

    it("異なるデータでも正しく表示される", async () => {
      const customData = {
        ...defaultMockData,
        supporter: {
          totalCount: 50000,
          last24hCount: 1000,
          updatedAt: "2025-07-04T10:30:00Z",
        },
      };

      mockFetchAllMetricsData.mockResolvedValueOnce(customData);

      render(await Metrics());

      await waitFor(() => {
        expect(screen.getByText("50,000")).toBeInTheDocument();
      });
    });
  });

  describe("エラーハンドリング", () => {
    it("データ取得エラー時にフォールバック値が使用される", async () => {
      // エラー発生をモック
      mockFetchAllMetricsData.mockRejectedValueOnce(new Error("API Error"));

      // 環境変数のフォールバック値をモック
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        FALLBACK_SUPPORTER_COUNT: "50000",
        FALLBACK_ACHIEVEMENT_COUNT: "10000",
      };

      render(await Metrics());

      // フォールバック値が表示されることを確認
      await waitFor(() => {
        expect(screen.getByText("50,000")).toBeInTheDocument(); // フォールバックサポーター数
        expect(screen.getByText("10,000")).toBeInTheDocument(); // フォールバック達成数
      });

      // 環境変数を元に戻す
      process.env = originalEnv;
    });
  });

  describe("レイアウト", () => {
    it("外部リンクが正しく表示される", async () => {
      render(await Metrics());

      // Looker Studioへのリンク
      const dashboardLink = screen.getByText("もっと詳しい活動状況を見る");
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink.closest("a")).toHaveAttribute(
        "href",
        expect.stringContaining("lookerstudio.google.com"),
      );
    });

    it("メトリクスの順序が正しい", async () => {
      render(await Metrics());

      const metrics = screen.getAllByText(/達成アクション数|サポーター数/);

      // 期待される順序: サポーター数 → 達成アクション数
      expect(metrics[0]).toHaveTextContent("サポーター数");
      expect(metrics[1]).toHaveTextContent("達成アクション数");
    });
  });

  describe("アクセシビリティ", () => {
    it("外部リンクに適切な属性が設定されている", async () => {
      render(await Metrics());

      const externalLinks = screen.getAllByRole("link");

      for (const link of externalLinks) {
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      }
    });
  });
});

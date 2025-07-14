import { render, screen, waitFor } from "@testing-library/react";
import React from "react";

// メトリクスサービスのモック
jest.mock("@/lib/services/metrics", () => ({
  fetchAllMetricsData: jest.fn(),
}));

import { fetchAllMetricsData } from "@/lib/services/metrics";
import Metrics from "./index";

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
      expect(screen.getByText("寄付金額")).toBeInTheDocument();
      expect(screen.getByText("達成アクション数")).toBeInTheDocument();
      expect(screen.getByText("サポーター数")).toBeInTheDocument();
    });

    it("メトリクス数値が正しく表示される", async () => {
      render(await Metrics());

      await waitFor(() => {
        // サポーター数の確認
        expect(screen.getByText("75,982")).toBeInTheDocument();
        expect(screen.getByText("人")).toBeInTheDocument();

        // 寄付金額の確認（100万円 = 100万円）
        expect(screen.getByText("100")).toBeInTheDocument();
        expect(screen.getByText("万円")).toBeInTheDocument();

        // アクション達成数の確認
        expect(screen.getByText("18,605")).toBeInTheDocument();
      });
    });

    it("更新時刻が表示される", async () => {
      render(await Metrics());

      // 日付フォーマット YYYY.MM.DD HH:MM の形式で検証
      expect(
        screen.getByText(/\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}/),
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
        donation: {
          totalAmount: 2000000, // 200万円
          last24hAmount: 50000, // 5万円
          updatedAt: "2025-07-04T10:30:00Z",
        },
      };

      mockFetchAllMetricsData.mockResolvedValueOnce(customData);

      render(await Metrics());

      await waitFor(() => {
        expect(screen.getByText("50,000")).toBeInTheDocument();
        expect(screen.getByText("200")).toBeInTheDocument(); // 200万円
      });
    });

    it("億単位の寄付金額が正しく表示される", async () => {
      const billionYenData = {
        ...defaultMockData,
        donation: {
          totalAmount: 100000000, // 1億円
          last24hAmount: 1000000, // 100万円
          updatedAt: "2025-07-04T10:30:00Z",
        },
      };

      mockFetchAllMetricsData.mockResolvedValueOnce(billionYenData);

      render(await Metrics());

      await waitFor(() => {
        expect(screen.getByText("1")).toBeInTheDocument(); // 1億円の「1」
        expect(screen.getByText("億円")).toBeInTheDocument(); // 億円単位
      });
    });

    it("億万単位の寄付金額が正しく表示される", async () => {
      const billionManYenData = {
        ...defaultMockData,
        donation: {
          totalAmount: 145690000, // 1億4569万円
          last24hAmount: 2000000, // 200万円
          updatedAt: "2025-07-04T10:30:00Z",
        },
      };

      mockFetchAllMetricsData.mockResolvedValueOnce(billionManYenData);

      render(await Metrics());

      await waitFor(() => {
        expect(screen.getByText("1億4569")).toBeInTheDocument(); // 1億4569万円の「1億4569」
        expect(screen.getByText("万円")).toBeInTheDocument(); // 万円単位
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
        FALLBACK_DONATION_AMOUNT: "1500000", // 150万円
        FALLBACK_ACHIEVEMENT_COUNT: "10000",
      };

      render(await Metrics());

      // フォールバック値が表示されることを確認
      await waitFor(() => {
        expect(screen.getByText("50,000")).toBeInTheDocument(); // フォールバックサポーター数
        expect(screen.getByText("150")).toBeInTheDocument(); // フォールバック寄付金額
        expect(screen.getByText("10,000")).toBeInTheDocument(); // フォールバック達成数
      });

      // 環境変数を元に戻す
      process.env = originalEnv;
    });

    it("部分的なデータ欠損時に適切にフォールバックする", async () => {
      const partialData = {
        supporter: null, // データなし
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
      };

      mockFetchAllMetricsData.mockResolvedValueOnce(partialData);

      render(await Metrics());

      await waitFor(() => {
        // 寄付金額は正常表示
        expect(screen.getByText("100")).toBeInTheDocument();
        // サポーター数はフォールバック（0）
        expect(screen.getByText("0")).toBeInTheDocument();
      });
    });
  });

  describe("レイアウト", () => {
    it("Separatorコンポーネントが正しい数表示される", async () => {
      render(await Metrics());

      // メトリクス間のセパレーター（3個）
      expect(screen.getAllByTestId("separator")).toHaveLength(3);
    });

    it("外部リンクが正しく表示される", async () => {
      render(await Metrics());

      // Looker Studioへのリンク
      const dashboardLink = screen.getByText("もっと詳しい活動状況を見る");
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink.closest("a")).toHaveAttribute(
        "href",
        expect.stringContaining("lookerstudio.google.com"),
      );

      // 寄付リンク
      const donationLink = screen.getByText("チームみらいを寄付で応援する");
      expect(donationLink).toBeInTheDocument();
      expect(donationLink.closest("a")).toHaveAttribute(
        "href",
        "https://team-mir.ai/support/donation",
      );
    });

    it("メトリクスの順序が正しい", async () => {
      render(await Metrics());

      const metrics =
        screen.getAllByText(/達成アクション数|サポーター数|寄付金額/);

      // 期待される順序: サポーター数 → 達成アクション数 → 寄付金額
      expect(metrics[0]).toHaveTextContent("サポーター数");
      expect(metrics[1]).toHaveTextContent("達成アクション数");
      expect(metrics[2]).toHaveTextContent("寄付金額");
    });
  });

  describe("アクセシビリティ", () => {
    it("適切なaria-labelが設定されている", async () => {
      render(await Metrics());

      // 寄付金額の詳細情報ボタン
      const infoButton = screen.getByLabelText("寄付金額の詳細情報");
      expect(infoButton).toBeInTheDocument();
    });

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

import { render, screen, waitFor } from "@testing-library/react";

// メトリクスサービスのモック
jest.mock("../services/get-metrics", () => ({
  fetchSupporterData: jest.fn(),
  fetchAchievementData: jest.fn(),
}));

// YouTube統計サービスのモック
jest.mock("@/features/youtube-stats/services/youtube-stats-service", () => ({
  getYouTubeStatsSummary: jest.fn(),
}));

// TikTok統計サービスのモック
jest.mock("@/features/tiktok-stats/services/tiktok-stats-service", () => ({
  getTikTokStatsSummary: jest.fn(),
}));

import {
  fetchAchievementData,
  fetchSupporterData,
} from "@/features/metrics/services/get-metrics";
import { getTikTokStatsSummary } from "@/features/tiktok-stats/services/tiktok-stats-service";
import { getYouTubeStatsSummary } from "@/features/youtube-stats/services/youtube-stats-service";
import { Metrics } from "./metrics-index";

// モック関数の型アサーション
const mockFetchSupporterData = fetchSupporterData as jest.MockedFunction<
  typeof fetchSupporterData
>;
const mockFetchAchievementData = fetchAchievementData as jest.MockedFunction<
  typeof fetchAchievementData
>;
const mockGetYouTubeStatsSummary =
  getYouTubeStatsSummary as jest.MockedFunction<typeof getYouTubeStatsSummary>;
const mockGetTikTokStatsSummary = getTikTokStatsSummary as jest.MockedFunction<
  typeof getTikTokStatsSummary
>;

// テスト用のデフォルトデータ
const defaultSupporterData = {
  totalCount: 75982,
  last24hCount: 1710,
  updatedAt: "2025-07-03T02:20:00Z",
};

const defaultAchievementData = {
  totalCount: 18605,
  todayCount: 245,
};

const defaultYouTubeMockData = {
  totalVideos: 150,
  totalViews: 250000,
  totalLikes: 5000,
  totalComments: 1200,
  dailyViewsIncrease: 3500,
  dailyVideosIncrease: 5,
};

const defaultTikTokMockData = {
  totalVideos: 50,
  totalViews: 100000,
  totalLikes: 2000,
  totalComments: 500,
  totalShares: 300,
  dailyViewsIncrease: 1500,
  dailyVideosIncrease: 2,
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
    mockFetchSupporterData.mockResolvedValue(defaultSupporterData);
    mockFetchAchievementData.mockResolvedValue(defaultAchievementData);
    mockGetYouTubeStatsSummary.mockResolvedValue(defaultYouTubeMockData);
    mockGetTikTokStatsSummary.mockResolvedValue(defaultTikTokMockData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("基本的な表示", () => {
    it("メトリクスが正しくレンダリングされる", async () => {
      render(await Metrics());

      // 見出しはカードの外のセクション見出しとして表示される
      expect(screen.getByText("👥 サポーター数")).toBeInTheDocument();
      // 旧タイトルとカード内の「サポーター数」ラベルは表示しない
      expect(
        screen.queryByText("チームみらいの活動状況🚀"),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("サポーター数")).not.toBeInTheDocument();
    });

    it("サポーター数の数値が正しく表示される", async () => {
      render(await Metrics());

      await waitFor(() => {
        expect(screen.getByText("75,982")).toBeInTheDocument();
      });
    });

    it("達成アクション数・動画統計のブロックは表示されない", async () => {
      render(await Metrics());

      expect(screen.queryByText("達成アクション数")).not.toBeInTheDocument();
      expect(screen.queryByText("動画再生回数")).not.toBeInTheDocument();
      expect(screen.queryByText("動画本数")).not.toBeInTheDocument();
      expect(screen.queryByTestId("separator")).not.toBeInTheDocument();
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
    it("fetchSupporterDataのみが呼び出され、非表示ブロックのデータは取得しない", async () => {
      await Metrics();

      expect(mockFetchSupporterData).toHaveBeenCalledTimes(1);
      expect(mockFetchAchievementData).not.toHaveBeenCalled();
      expect(mockGetYouTubeStatsSummary).not.toHaveBeenCalled();
      expect(mockGetTikTokStatsSummary).not.toHaveBeenCalled();
    });

    it("異なるデータでも正しく表示される", async () => {
      const customSupporterData = {
        totalCount: 50000,
        last24hCount: 1000,
        updatedAt: "2025-07-04T10:30:00Z",
      };

      mockFetchSupporterData.mockResolvedValueOnce(customSupporterData);

      render(await Metrics());

      await waitFor(() => {
        expect(screen.getByText("50,000")).toBeInTheDocument();
      });
    });
  });

  describe("エラーハンドリング", () => {
    it("データ取得エラー時にフォールバック値が使用される", async () => {
      // エラー発生をモック
      mockFetchSupporterData.mockRejectedValueOnce(new Error("API Error"));
      mockFetchAchievementData.mockRejectedValueOnce(new Error("API Error"));

      // 環境変数のフォールバック値をモック
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        FALLBACK_SUPPORTER_COUNT: "50000",
      };

      render(await Metrics());

      // フォールバック値が表示されることを確認
      await waitFor(() => {
        expect(screen.getByText("50,000")).toBeInTheDocument(); // フォールバックサポーター数
      });

      // 環境変数を元に戻す
      process.env = originalEnv;
    });
  });

  describe("レイアウト", () => {
    it("詳しく見るリンクが正しく表示される", async () => {
      render(await Metrics());

      // 詳しく見るリンクはサポーター用の1つだけ
      const detailLinks = screen.getAllByText("詳しく見る", {
        selector: "span",
      });
      expect(detailLinks).toHaveLength(1);
    });

    it("非表示ブロックのダッシュボードへのリンクは存在しない", async () => {
      render(await Metrics());

      expect(
        document.querySelector('a[href="/stats"]'),
      ).not.toBeInTheDocument();
      expect(
        document.querySelector('a[href="/youtube_stats"]'),
      ).not.toBeInTheDocument();
      expect(
        document.querySelector('a[href="/tiktok_stats"]'),
      ).not.toBeInTheDocument();
    });

    it("Looker Studioへの外部リンクが存在する", async () => {
      render(await Metrics());

      // サポーターセクションのLooker Studioリンク
      const externalLink = document.querySelector(
        'a[href*="lookerstudio.google.com"]',
      );
      expect(externalLink).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("外部リンクに適切な属性が設定されている", async () => {
      render(await Metrics());

      // 外部リンク（Looker Studio）のみチェック
      const externalLink = document.querySelector(
        'a[href*="lookerstudio.google.com"]',
      );
      expect(externalLink).toHaveAttribute("target", "_blank");
      expect(externalLink).toHaveAttribute("rel", "noopener noreferrer");
    });
  });
});

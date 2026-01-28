import { render, screen, waitFor } from "@testing-library/react";

// メトリクスサービスのモック
jest.mock("../services/get-metrics", () => ({
  fetchAllMetricsData: jest.fn(),
}));

// YouTube統計サービスのモック
jest.mock("@/features/youtube-stats/services/youtube-stats-service", () => ({
  getYouTubeStatsSummary: jest.fn(),
}));

// TikTok統計サービスのモック
jest.mock("@/features/tiktok-stats/services/tiktok-stats-service", () => ({
  getTikTokStatsSummary: jest.fn(),
}));

import { fetchAllMetricsData } from "@/features/metrics/services/get-metrics";
import { getTikTokStatsSummary } from "@/features/tiktok-stats/services/tiktok-stats-service";
import { getYouTubeStatsSummary } from "@/features/youtube-stats/services/youtube-stats-service";
import { Metrics } from "./metrics-index";

// モック関数の型アサーション
const mockFetchAllMetricsData = fetchAllMetricsData as jest.MockedFunction<
  typeof fetchAllMetricsData
>;
const mockGetYouTubeStatsSummary =
  getYouTubeStatsSummary as jest.MockedFunction<typeof getYouTubeStatsSummary>;
const mockGetTikTokStatsSummary = getTikTokStatsSummary as jest.MockedFunction<
  typeof getTikTokStatsSummary
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
    mockFetchAllMetricsData.mockResolvedValue(defaultMockData);
    mockGetYouTubeStatsSummary.mockResolvedValue(defaultYouTubeMockData);
    mockGetTikTokStatsSummary.mockResolvedValue(defaultTikTokMockData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("基本的な表示", () => {
    it("メトリクスが正しくレンダリングされる", async () => {
      render(await Metrics());

      expect(screen.getByText("チームみらいの活動状況🚀")).toBeInTheDocument();
      expect(screen.getByText("動画再生回数")).toBeInTheDocument();
      expect(screen.getByText("動画本数")).toBeInTheDocument();
      expect(screen.getByText("サポーター数")).toBeInTheDocument();
    });

    it("メトリクス数値が正しく表示される（YouTube + TikTok合算）", async () => {
      render(await Metrics());

      await waitFor(() => {
        // サポーター数の確認
        expect(screen.getByText("75,982")).toBeInTheDocument();

        // 動画再生回数の確認（250,000 + 100,000 = 350,000）
        expect(screen.getByText("350,000")).toBeInTheDocument();

        // 動画本数の確認（150 + 50 = 200）
        expect(screen.getByText("200")).toBeInTheDocument();
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

      // 詳しく見るリンクが2つ（サポーター用 + アクション数用）
      const detailLinks = screen.getAllByText("詳しく見る", {
        selector: "span",
      });
      expect(detailLinks).toHaveLength(2); // サポーター + アクション数
    });

    it("アクション数ダッシュボードへの内部リンクが存在する", async () => {
      render(await Metrics());

      // アクション数セクションの/statsリンク
      const statsLink = document.querySelector('a[href="/stats"]');
      expect(statsLink).toBeInTheDocument();
    });

    it("Looker Studioへの外部リンクが存在する", async () => {
      render(await Metrics());

      // サポーターセクションのLooker Studioリンク
      const externalLink = document.querySelector(
        'a[href*="lookerstudio.google.com"]',
      );
      expect(externalLink).toBeInTheDocument();
    });

    it("メトリクスの順序が正しい", async () => {
      render(await Metrics());

      const metrics = screen.getAllByText(/動画再生回数|サポーター数/);

      // 期待される順序: サポーター数 → 動画再生回数
      expect(metrics[0]).toHaveTextContent("サポーター数");
      expect(metrics[1]).toHaveTextContent("動画再生回数");
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

    it("内部リンクには適切な属性が設定されていない", async () => {
      render(await Metrics());

      // 内部リンク（/youtube_stats, /tiktok_stats）はtarget="_blank"を持たない
      const youtubeLink = document.querySelector('a[href="/youtube_stats"]');
      expect(youtubeLink).toBeInTheDocument();
      expect(youtubeLink).not.toHaveAttribute("target", "_blank");

      const tiktokLink = document.querySelector('a[href="/tiktok_stats"]');
      expect(tiktokLink).toBeInTheDocument();
      expect(tiktokLink).not.toHaveAttribute("target", "_blank");
    });
  });
});

import { Separator } from "@/components/ui/separator";
import type {
  AchievementData,
  DonationData,
  RegistrationData,
  SupporterData,
} from "@/features/metrics/types/metrics-types";
import { formatUpdateTime } from "@/lib/utils/metrics-formatter";
import { fetchAllMetricsData } from "../services/get-metrics";
import { AchievementMetric } from "./achievement-metric";
import { DonationMetric } from "./donation-metric";
import { MetricsLayout } from "./metrics-layout";
import { SupporterMetric } from "./supporter-metric";

export { MetricsErrorBoundary } from "./metrics-error-boundary";
export { MetricsWithSuspense } from "./metrics-with-suspense";

/**
 * メトリクス表示コンポーネント
 *
 * チームみらいの活動状況を表示するメインコンポーネント
 * 以下のデータを統合して表示：
 * 1. サポーター数（外部API）
 * 2. 寄付金額（外部API）
 * 3. アクション達成数（Supabase）
 * 4. ユーザー登録数（Supabase）
 */
export async function Metrics() {
  let metricsData: {
    supporter: SupporterData | null;
    donation: DonationData | null;
    achievement: AchievementData | null;
    registration: RegistrationData | null;
  };
  try {
    metricsData = await fetchAllMetricsData();
  } catch (error) {
    console.error("Failed to fetch metrics data:", error);
    // エラー時はnullデータでフォールバック値を使用
    metricsData = {
      supporter: null,
      donation: null,
      achievement: null,
      registration: null,
    };
  }

  const fallbackSupporterCount =
    Number(process.env.FALLBACK_SUPPORTER_COUNT) || 0;
  const fallbackSupporterIncrease =
    Number(process.env.FALLBACK_SUPPORTER_INCREASE) || 0;
  const fallbackDonationAmount =
    Number(process.env.FALLBACK_DONATION_AMOUNT) || 0;
  const fallbackDonationIncrease =
    Number(process.env.FALLBACK_DONATION_INCREASE) || 0;
  const fallbackAchievementCount =
    Number(process.env.FALLBACK_ACHIEVEMENT_COUNT) || 0;
  const fallbackTodayAchievementCount =
    Number(process.env.FALLBACK_TODAY_ACHIEVEMENT_COUNT) || 0;

  const lastUpdated = metricsData.supporter?.updatedAt
    ? formatUpdateTime(metricsData.supporter.updatedAt)
    : process.env.FALLBACK_UPDATE_DATE || "2025.07.03 02:20";

  return (
    <MetricsLayout title="チームみらいの活動状況🚀" lastUpdated={lastUpdated}>
      {/* サポーター数 */}
      <SupporterMetric
        data={metricsData.supporter}
        fallbackCount={fallbackSupporterCount}
        fallbackIncrease={fallbackSupporterIncrease}
      />

      {/* 水平セパレーター */}
      <Separator orientation="horizontal" className="my-4" />

      {/* アクション達成数 */}
      <AchievementMetric
        data={
          metricsData.achievement || {
            totalCount: fallbackAchievementCount,
            todayCount: fallbackTodayAchievementCount,
          }
        }
        fallbackTotal={fallbackAchievementCount}
        fallbackToday={fallbackTodayAchievementCount}
      />

      {/* 水平セパレーター */}
      <Separator orientation="horizontal" className="my-4" />

      {/* 寄付金額 */}
      <DonationMetric
        data={metricsData.donation}
        fallbackAmount={fallbackDonationAmount}
        fallbackIncrease={fallbackDonationIncrease}
      />

      {/* 水平セパレーター */}
      <Separator orientation="horizontal" className="my-4" />

      {/* ダッシュボードリンク */}
      <div className="text-center">
        <a
          href="https://lookerstudio.google.com/u/0/reporting/e4efc74f-051c-4815-87f1-e4b5e93a3a8c/page/p_p5421pqhtd"
          className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 text-sm transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>もっと詳しい活動状況を見る</span>
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>外部リンク</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </MetricsLayout>
  );
}

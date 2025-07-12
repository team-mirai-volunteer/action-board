import { Separator } from "@/components/ui/separator";
import { fetchAllMetricsData } from "@/lib/services/metrics";
import { formatUpdateTime } from "@/lib/utils/metrics-formatter";
import { AchievementMetric } from "./achievement-metric";
import { DonationMetric } from "./donation-metric";
import { MetricsLayout } from "./metrics-layout";
import { SupporterMetric } from "./supporter-metric";

export { MetricsErrorBoundary } from "./MetricsErrorBoundary";
export { default as MetricsWithSuspense } from "./MetricsWithSuspense";

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
export default async function Metrics() {
  const metricsData = await fetchAllMetricsData();

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
      {/* アクション達成数 */}
      <AchievementMetric
        data={metricsData.achievement}
        fallbackTotal={fallbackAchievementCount}
        fallbackToday={fallbackTodayAchievementCount}
      />

      {/* 水平セパレーター */}
      <Separator orientation="horizontal" className="my-4" />

      {/* サポーター数 */}
      <SupporterMetric
        data={metricsData.supporter}
        fallbackCount={fallbackSupporterCount}
        fallbackIncrease={fallbackSupporterIncrease}
      />

      {/* 水平セパレーター */}
      <Separator orientation="horizontal" className="my-4" />

      {/* 寄付金額 */}
      <DonationMetric
        data={metricsData.donation}
        fallbackAmount={fallbackDonationAmount}
        fallbackIncrease={fallbackDonationIncrease}
      />

      {/* リンクセクション */}
      <div className="flex flex-col items-center gap-3 mt-6 pt-4 border-t border-gray-200">
        <a
          href="https://team-mir.ai/support/donation"
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>チームみらいを寄付で応援する</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>ご寄付に関するご案内</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>

        <a
          href="https://lookerstudio.google.com/u/0/reporting/e4efc74f-051c-4815-87f1-e4b5e93a3a8c/page/p_p5421pqhtd"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-700 font-medium text-sm transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>もっと詳しい活動状況を見る</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>チームみらいダッシュボード</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </a>
      </div>
    </MetricsLayout>
  );
}

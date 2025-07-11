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
      {/* 上段：アクション数とサポーター数を左右に分割表示 */}
      <div className="flex items-stretch mb-6">
        {/* 左側：アクション達成数 */}
        <AchievementMetric
          data={metricsData.achievement}
          fallbackTotal={fallbackAchievementCount}
          fallbackToday={fallbackTodayAchievementCount}
        />

        {/* 中央：縦線セパレーター */}
        <Separator orientation="vertical" className="mx-4 h-full" />

        {/* 右側：サポーター数 */}
        <SupporterMetric
          data={metricsData.supporter}
          fallbackCount={fallbackSupporterCount}
          fallbackIncrease={fallbackSupporterIncrease}
        />
      </div>

      {/* 寄付金額表示エリア（下段） */}
      <DonationMetric
        data={metricsData.donation}
        fallbackAmount={fallbackDonationAmount}
        fallbackIncrease={fallbackDonationIncrease}
      />
    </MetricsLayout>
  );
}

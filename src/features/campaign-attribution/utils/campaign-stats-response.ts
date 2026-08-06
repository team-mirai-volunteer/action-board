import type { CampaignAttributionStat } from "../services/campaign-attribution-stats";

export const DEFAULT_CAMPAIGN_STATS_LIMIT = 50;

export type CampaignStatsFilters = {
  campaignCodePrefix: string | null;
  from: string | null;
  to: string | null;
};

export type CampaignStatsResponse = {
  filters: CampaignStatsFilters;
  /** 条件に一致する登録数の合計（limitで絞る前の全キャンペーン分） */
  totalRegistrations: number;
  /** 条件に一致するキャンペーンコードの数（limitで絞る前） */
  campaignCount: number;
  campaigns: CampaignAttributionStat[];
  truncated: boolean;
  notes: string[];
};

/**
 * キャンペーン別集計を、MCPツールのレスポンス形式に整形する
 *
 * notesには数字の読み違いを防ぐための注意書きを含める
 * （何がカウントされ、何がカウントされないか）。
 */
export function buildCampaignStatsResponse(
  stats: CampaignAttributionStat[],
  filters: CampaignStatsFilters,
  limit: number = DEFAULT_CAMPAIGN_STATS_LIMIT,
): CampaignStatsResponse {
  const campaigns = stats.slice(0, limit);
  const totalRegistrations = stats.reduce(
    (sum, stat) => sum + stat.registrations,
    0,
  );

  const notes = [
    "キャンペーンコード付きURL（?cv=コード）経由で新規登録したユーザー数です。既に登録済みのユーザーが同じURLから訪れてもカウントされません。",
    "1ユーザーにつき1コード（先勝ち）で記録されます。複数のキャンペーンURLを経由した場合は最初のコードだけが残ります。",
    "党員登録・寄付の実績はアクションボードではなく公式サイト（Stripe）側の集計です。",
  ];

  if (stats.length === 0) {
    notes.push(
      "条件に一致するキャンペーンコードの登録はまだありません。配布URLに ?cv= が付いているか、コードの綴りを確認してください。",
    );
  }

  if (campaigns.length < stats.length) {
    notes.push(
      `キャンペーンコードは全${stats.length}件のうち、登録数の多い順に${campaigns.length}件のみ表示しています。`,
    );
  }

  return {
    filters,
    totalRegistrations,
    campaignCount: stats.length,
    campaigns,
    truncated: campaigns.length < stats.length,
    notes,
  };
}

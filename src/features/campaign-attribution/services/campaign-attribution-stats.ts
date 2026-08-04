import "server-only";

import { createAdminClient } from "@/lib/supabase/adminClient";
import { isValidCampaignCodeFormat } from "@/lib/validation/campaign-attribution";

// 集計の日付指定はJSTの「日」単位で受け取る（依頼者は組織活動本部・広報のため、UTCではなくJSTで揃える）
export const JST_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export type CampaignAttributionStatsParams = {
  /** キャンペーンコードの前方一致フィルタ（大文字小文字を区別しない）。省略時は全キャンペーン */
  campaignCodePrefix?: string;
  /** 登録日の下限（JST・YYYY-MM-DD・その日を含む） */
  from?: string;
  /** 登録日の上限（JST・YYYY-MM-DD・その日を含む） */
  to?: string;
};

export type CampaignAttributionStat = {
  campaignCode: string;
  registrations: number;
  firstRegisteredAt: string | null;
  lastRegisteredAt: string | null;
};

/**
 * JSTの日付（YYYY-MM-DD）を、その日の開始/終了時点のタイムスタンプに変換する
 *
 * start: 00:00:00.000+09:00 / end: 23:59:59.999+09:00（どちらも境界を含む）
 */
export function toJstRangeBoundary(
  date: string,
  boundary: "start" | "end",
): string {
  if (!JST_DATE_REGEX.test(date)) {
    throw new Error(`日付は YYYY-MM-DD 形式で指定してください: ${date}`);
  }

  const suffix =
    boundary === "start" ? "T00:00:00.000+09:00" : "T23:59:59.999+09:00";
  const timestamp = new Date(`${date}${suffix}`);

  if (Number.isNaN(timestamp.getTime())) {
    throw new Error(`存在しない日付です: ${date}`);
  }

  return timestamp.toISOString();
}

/**
 * キャンペーンコード（?cv=）別の新規登録数を集計する
 *
 * 集計はDB関数（get_campaign_attribution_stats）側でGROUP BYする。
 * 返すのは集計値のみで、個人（user_id）は含めない。
 * 問い合わせ対応ボット（みらいいぬ）向けMCPツールから利用される想定。
 */
export async function getCampaignAttributionStats({
  campaignCodePrefix,
  from,
  to,
}: CampaignAttributionStatsParams = {}): Promise<CampaignAttributionStat[]> {
  const prefix = campaignCodePrefix?.trim();
  if (prefix && !isValidCampaignCodeFormat(prefix)) {
    throw new Error(
      `キャンペーンコードは英数字・ハイフン・アンダースコアの1〜50文字で指定してください: ${prefix}`,
    );
  }

  // DB関数側の引数はいずれも省略可（未指定なら絞り込まない）。
  // undefined はJSON化時に落ちるため、null ではなく undefined を渡す
  const registeredFrom = from ? toJstRangeBoundary(from, "start") : undefined;
  const registeredTo = to ? toJstRangeBoundary(to, "end") : undefined;

  // 期間が逆順のときは常に0件になってしまうため、無言で空を返さずエラーにする
  if (registeredFrom && registeredTo && registeredFrom > registeredTo) {
    throw new Error(
      `期間の指定が逆になっています（from: ${from} / to: ${to}）`,
    );
  }

  const supabaseAdmin = await createAdminClient();
  const { data, error } = await supabaseAdmin.rpc(
    "get_campaign_attribution_stats",
    {
      campaign_code_prefix: prefix || undefined,
      registered_from: registeredFrom,
      registered_to: registeredTo,
    },
  );

  if (error) {
    throw new Error(`キャンペーン別集計の取得に失敗しました: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    campaignCode: row.campaign_code,
    registrations: Number(row.registrations),
    firstRegisteredAt: row.first_registered_at,
    lastRegisteredAt: row.last_registered_at,
  }));
}

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

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * JSTの日付（YYYY-MM-DD）を、集計に渡すタイムスタンプに変換する
 *
 * - start: その日の 00:00:00 JST（下限・含む）
 * - endExclusive: 翌日の 00:00:00 JST（上限・含まない）
 *
 * 上限を「その日の 23:59:59.999」にせず翌日0時の排他境界にするのは、created_at が
 * マイクロ秒精度で、23:59:59.999001〜.999999 の登録を取りこぼさないため。
 * 呼び出し側から見た契約は「to に指定した日を含む」で変わらない。
 */
export function toJstRangeBoundary(
  date: string,
  boundary: "start" | "endExclusive",
): string {
  if (!JST_DATE_REGEX.test(date)) {
    throw new Error(`日付は YYYY-MM-DD 形式で指定してください: ${date}`);
  }

  // 2026-02-30 のような存在しない日は Date が翌月に繰り上げてしまい NaN にならないため、
  // 暦日として実在するかを年月日の一致で確かめる（別日の統計を返さないため）
  const [year, month, day] = date.split("-").map(Number);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() + 1 !== month ||
    probe.getUTCDate() !== day
  ) {
    throw new Error(`存在しない日付です: ${date}`);
  }

  const dayOffset = boundary === "start" ? 0 : 1;

  return new Date(
    Date.UTC(year, month - 1, day + dayOffset) - JST_OFFSET_MS,
  ).toISOString();
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

  // 期間が逆順のときは常に0件になってしまうため、無言で空を返さずエラーにする
  // （YYYY-MM-DD は辞書順比較で日付順と一致する）
  if (from && to && from > to) {
    throw new Error(
      `期間の指定が逆になっています（from: ${from} / to: ${to}）`,
    );
  }

  // DB関数側の引数はいずれも省略可（未指定なら絞り込まない）。
  // undefined はJSON化時に落ちるため、null ではなく undefined を渡す
  const supabaseAdmin = await createAdminClient();
  const { data, error } = await supabaseAdmin.rpc(
    "get_campaign_attribution_stats",
    {
      campaign_code_prefix: prefix || undefined,
      registered_from: from ? toJstRangeBoundary(from, "start") : undefined,
      registered_before: to
        ? toJstRangeBoundary(to, "endExclusive")
        : undefined,
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

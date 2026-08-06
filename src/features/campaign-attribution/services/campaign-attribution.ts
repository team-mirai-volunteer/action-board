import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/supabase";
import { isValidCampaignCodeFormat } from "@/lib/validation/campaign-attribution";

// キャンペーンコード（キャラバン会場QR等の ?cv= 経由の登録）を登録者本人に紐づけて保存する。
// 計測用の付帯処理のため、失敗してもサインアップ処理は妨げない（警告ログのみ）。
export async function saveCampaignAttribution(
  supabase: SupabaseClient<Database>,
  userId: string,
  campaignCode: string,
): Promise<void> {
  if (!isValidCampaignCodeFormat(campaignCode)) {
    return;
  }

  try {
    const { error } = await supabase.from("user_campaign_attribution").insert({
      user_id: userId,
      campaign_code: campaignCode,
    });

    // 23505: 主キー重複。同一ユーザーの2回目以降は先勝ちで無視する
    if (error && error.code !== "23505") {
      console.warn("キャンペーンコード保存エラー:", error);
    }
  } catch (e) {
    console.warn("キャンペーンコード処理エラー:", e);
  }
}

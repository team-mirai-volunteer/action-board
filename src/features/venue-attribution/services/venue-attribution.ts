import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/supabase";
import { isValidVenueCodeFormat } from "@/lib/validation/venue-attribution";

// 会場コード（キャラバン等の会場別QRコード経由の登録）を登録者本人に紐づけて保存する。
// 計測用の付帯処理のため、失敗してもサインアップ処理は妨げない（警告ログのみ）。
export async function saveVenueAttribution(
  supabase: SupabaseClient<Database>,
  userId: string,
  venueCode: string,
): Promise<void> {
  if (!isValidVenueCodeFormat(venueCode)) {
    return;
  }

  try {
    const { error } = await supabase.from("user_venue_attribution").insert({
      user_id: userId,
      venue_code: venueCode,
    });

    // 23505: 主キー重複。同一ユーザーの2回目以降は先勝ちで無視する
    if (error && error.code !== "23505") {
      console.warn("会場コード保存エラー:", error);
    }
  } catch (e) {
    console.warn("会場コード処理エラー:", e);
  }
}

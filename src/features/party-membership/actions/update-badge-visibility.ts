"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/supabase";

type PartyMembershipRow = Tables<"party_memberships">;

export type UpdateBadgeVisibilityResult =
  | {
      success: true;
      membership: PartyMembershipRow;
    }
  | {
      success: false;
      error: string;
    };

export async function updateBadgeVisibility(
  visible: boolean,
): Promise<UpdateBadgeVisibilityResult> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Failed to resolve current user:", userError);
      return {
        success: false,
        error: "ユーザー情報を取得できませんでした。",
      };
    }

    const supabaseAdmin = await createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("party_memberships")
      .update({ badge_visibility: visible })
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update party badge visibility:", error);
      return {
        success: false,
        error: "バッジ表示設定の更新に失敗しました。",
      };
    }

    if (!data) {
      return {
        success: false,
        error: "党員情報が見つかりません。同期をお待ちください。",
      };
    }

    revalidatePath("/settings/profile");
    revalidatePath(`/users/${data.user_id}`);

    return {
      success: true,
      membership: data,
    };
  } catch (error) {
    console.error("Unexpected error updating party badge visibility:", error);
    return {
      success: false,
      error: "バッジ表示設定の更新に失敗しました。",
    };
  }
}

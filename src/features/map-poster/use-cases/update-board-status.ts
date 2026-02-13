import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/supabase";
import type { BoardStatus } from "../types/poster-types";

export type UpdateBoardStatusInput = {
  boardId: string;
  userId: string;
  newStatus: BoardStatus;
  note?: string;
};

export type UpdateBoardStatusResult =
  | { success: true }
  | { success: false; error: string };

/**
 * ポスター掲示板のステータスを更新し、履歴を記録する
 * - ボードの現在のステータスを取得
 * - ステータスを更新
 * - ステータス変更履歴を挿入
 */
export async function updateBoardStatus(
  adminSupabase: SupabaseClient<Database>,
  input: UpdateBoardStatusInput,
): Promise<UpdateBoardStatusResult> {
  const { boardId, userId, newStatus, note } = input;

  // Get current board status
  const { data: currentBoard, error: fetchError } = await adminSupabase
    .from("poster_boards")
    .select("status")
    .eq("id", boardId)
    .single();

  if (fetchError) {
    console.error("Error fetching current board status:", fetchError);
    return {
      success: false,
      error: `掲示板の取得に失敗しました: ${fetchError.message}`,
    };
  }

  // Update board status
  const { error: updateError } = await adminSupabase
    .from("poster_boards")
    .update({ status: newStatus })
    .eq("id", boardId);

  if (updateError) {
    console.error("Error updating board status:", updateError);
    return {
      success: false,
      error: `ステータスの更新に失敗しました: ${updateError.message}`,
    };
  }

  // Insert history record
  const { error: historyError } = await adminSupabase
    .from("poster_board_status_history")
    .insert({
      board_id: boardId,
      user_id: userId,
      previous_status: currentBoard.status,
      new_status: newStatus,
      note: note || null,
    });

  if (historyError) {
    console.error("Error inserting status history:", historyError);
    return {
      success: false,
      error: `履歴の記録に失敗しました: ${historyError.message}`,
    };
  }

  return { success: true };
}

"use server";

import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/supabase";
import type { BoardStatus } from "../types/poster-types";
import { getPosterBoardStats } from "../use-cases/get-poster-board-stats";
import { updateBoardStatus } from "../use-cases/update-board-status";
import { mapUserToHistory } from "../utils/history-helpers";
import {
  countBoardsByStatus,
  createEmptyStatusCounts,
} from "../utils/poster-stats";

type PrefectureName = NonNullable<
  Database["public"]["Tables"]["poster_boards"]["Row"]["prefecture"]
>;

// 統計情報を取得するServer Action
export async function getPosterBoardStatsAction(
  prefecture: PrefectureName,
): Promise<{
  totalCount: number;
  statusCounts: Record<BoardStatus, number>;
}> {
  const supabase = await createAdminClient();
  const result = await getPosterBoardStats(supabase, prefecture);

  if (!result.success) {
    return {
      totalCount: 0,
      statusCounts: createEmptyStatusCounts(),
    };
  }

  return {
    totalCount: result.totalCount,
    statusCounts: result.statusCounts,
  };
}

// ユーザーが最後に編集した掲示板IDを取得
export async function getUserEditedBoardIdsAction(
  prefecture: PrefectureName,
  userId: string,
): Promise<string[]> {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  try {
    // RPC関数を使用して効率的にデータを取得
    const { data: editedBoards, error } = await supabase.rpc(
      "get_user_edited_boards_by_prefecture",
      {
        target_prefecture: prefecture,
        target_user_id: userId,
      },
    );

    if (error) {
      console.error("Error fetching user edited boards:", error);

      // フォールバック: RPC関数が存在しない場合は、ビューから直接取得
      const { data: viewData, error: viewError } = await supabase
        .from("poster_board_latest_editors")
        .select("board_id")
        .eq("prefecture", prefecture)
        .eq("last_editor_id", userId);

      if (viewError) {
        console.error("Error fetching from view:", viewError);
        return [];
      }

      return (
        viewData
          ?.map((item) => item.board_id)
          .filter((id): id is string => id !== null) || []
      );
    }

    // RPC成功時は結果を返す
    return (
      editedBoards?.map((item: { board_id: string }) => item.board_id) || []
    );
  } catch (error) {
    console.error("Error in getUserEditedBoardIdsAction:", error);
    return [];
  }
}

// 区割り別の統計情報を取得するServer Action
export async function getPosterBoardStatsByDistrictAction(
  district: string,
): Promise<{
  totalCount: number;
  statusCounts: Record<BoardStatus, number>;
}> {
  const supabase = await createAdminClient();

  try {
    const { data, error } = await supabase
      .from("poster_boards")
      .select("status")
      .eq("district", district)
      .not("lat", "is", null) // 座標なしを除外
      .not("long", "is", null) // 座標なしを除外
      .eq("archived", false);

    if (error) {
      console.error("Error fetching district stats:", error);
      return {
        totalCount: 0,
        statusCounts: createEmptyStatusCounts(),
      };
    }

    const boards = data || [];
    return {
      totalCount: boards.length,
      statusCounts: countBoardsByStatus(boards),
    };
  } catch (error) {
    console.error("Error in getPosterBoardStatsByDistrictAction:", error);
    return {
      totalCount: 0,
      statusCounts: createEmptyStatusCounts(),
    };
  }
}

// ユーザーが最後に編集した掲示板IDを区割り別に取得
export async function getUserEditedBoardIdsByDistrictAction(
  district: string,
  userId: string,
): Promise<string[]> {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  try {
    // 区割りでフィルタリングして取得
    const { data, error } = await supabase
      .from("poster_board_latest_editors")
      .select("board_id")
      .eq("district", district)
      .eq("archived", false)
      .eq("last_editor_id", userId);

    if (error) {
      console.error("Error fetching user edited boards by district:", error);

      // フォールバック: poster_boards テーブルから直接取得
      const { data: boardData, error: boardError } = await supabase
        .from("poster_boards")
        .select("id")
        .eq("district", district)
        .eq("archived", false);

      if (boardError || !boardData) {
        return [];
      }

      const boardIds = boardData.map((b) => b.id);

      const { data: historyData, error: historyError } = await supabase
        .from("poster_board_status_history")
        .select("board_id")
        .in("board_id", boardIds)
        .eq("user_id", userId);

      if (historyError) {
        return [];
      }

      return Array.from(
        new Set(
          historyData
            ?.map((h) => h.board_id)
            .filter((id): id is string => id !== null) || [],
        ),
      );
    }

    return (
      data
        ?.map((item) => item.board_id)
        .filter((id): id is string => id !== null) || []
    );
  } catch (error) {
    console.error("Error in getUserEditedBoardIdsByDistrictAction:", error);
    return [];
  }
}

// 個別の掲示板の履歴を取得
export async function getBoardStatusHistoryAction(boardId: string) {
  const supabase = await createAdminClient();

  // まず履歴データを取得
  const { data: historyData, error: historyError } = await supabase
    .from("poster_board_status_history")
    .select("*")
    .eq("board_id", boardId)
    .order("created_at", { ascending: false });

  if (historyError) {
    throw historyError;
  }

  if (!historyData || historyData.length === 0) {
    return [];
  }

  // ユーザーIDのリストを取得
  const userIds = Array.from(new Set(historyData.map((h) => h.user_id)));

  // ユーザー情報を取得
  const { data: userData, error: userError } = await supabase
    .from("public_user_profiles")
    .select("id, name, address_prefecture")
    .in("id", userIds);

  if (userError) {
    console.error("Error fetching user profiles:", userError);
    // ユーザー情報が取得できなくても履歴は返す
    return historyData.map((h) => ({ ...h, user: null }));
  }

  // ユーザー情報をマップに変換
  const userMap = new Map(userData?.map((u) => [u.id, u]) || []);

  // 履歴データにユーザー情報を追加
  return mapUserToHistory(historyData, userMap);
}

export async function updateBoardStatusAction(
  boardId: string,
  newStatus: BoardStatus,
  note?: string,
) {
  const supabase = await createAdminClient();

  // Get current user - required for history tracking
  const { createClient } = await import("@/lib/supabase/client");
  const supabaseAuth = createClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to update board status");
  }

  return updateBoardStatus(supabase, {
    boardId,
    userId: user.id,
    newStatus,
    note,
  });
}

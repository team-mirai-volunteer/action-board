"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/supabase";

type BoardStatus = Database["public"]["Enums"]["poster_board_status"];
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
  const supabase = await createClient();

  try {
    // 最適化されたRPC関数を使用
    const { data, error } = await supabase.rpc(
      "get_poster_board_stats_optimized",
      {
        target_prefecture: prefecture,
      },
    );

    if (error) {
      console.error("Error fetching stats with RPC:", error);

      // フォールバック: 元の実装を使用
      const statusTypes: BoardStatus[] = [
        "not_yet",
        "not_yet_dangerous",
        "reserved",
        "done",
        "error_wrong_place",
        "error_damaged",
        "error_wrong_poster",
        "other",
      ];

      const statusCounts: Record<BoardStatus, number> = {
        not_yet: 0,
        not_yet_dangerous: 0,
        reserved: 0,
        done: 0,
        error_wrong_place: 0,
        error_damaged: 0,
        error_wrong_poster: 0,
        other: 0,
      };

      // 並列でカウントクエリを実行
      const countPromises = statusTypes.map(async (status) => {
        const { count, error } = await supabase
          .from("poster_boards")
          .select("*", { count: "exact", head: true })
          .eq("prefecture", prefecture)
          .eq("status", status);

        if (error) {
          console.error(`Error counting ${status}:`, error);
          return { status, count: 0 };
        }

        return { status, count: count || 0 };
      });

      // 全件数のカウント
      const totalCountPromise = supabase
        .from("poster_boards")
        .select("*", { count: "exact", head: true })
        .eq("prefecture", prefecture);

      // すべてのクエリを並列実行
      const [statusResults, totalResult] = await Promise.all([
        Promise.all(countPromises),
        totalCountPromise,
      ]);

      // 結果を集計
      for (const result of statusResults) {
        statusCounts[result.status] = result.count;
      }

      const totalCount = totalResult.count || 0;

      return {
        totalCount,
        statusCounts,
      };
    }

    // RPC成功時はデータを変換して返す
    if (data && data.length > 0) {
      const result = data[0];
      return {
        totalCount: Number(result.total_count) || 0,
        statusCounts: result.status_counts as Record<BoardStatus, number>,
      };
    }

    // データがない場合のデフォルト値
    return {
      totalCount: 0,
      statusCounts: {
        not_yet: 0,
        not_yet_dangerous: 0,
        reserved: 0,
        done: 0,
        error_wrong_place: 0,
        error_damaged: 0,
        error_wrong_poster: 0,
        other: 0,
      },
    };
  } catch (error) {
    console.error("Error in getPosterBoardStatsAction:", error);
    // エラー時のデフォルト値
    return {
      totalCount: 0,
      statusCounts: {
        not_yet: 0,
        not_yet_dangerous: 0,
        reserved: 0,
        done: 0,
        error_wrong_place: 0,
        error_damaged: 0,
        error_wrong_poster: 0,
        other: 0,
      },
    };
  }
}

// ユーザーが最後に編集した掲示板IDを取得
export async function getUserEditedBoardIdsAction(
  prefecture: PrefectureName,
  userId: string,
): Promise<string[]> {
  const supabase = await createClient();

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

// 個別の掲示板の履歴を取得
export async function getBoardStatusHistoryAction(boardId: string) {
  const supabase = await createClient();

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
  return historyData.map((h) => ({
    ...h,
    user: userMap.get(h.user_id) || null,
  }));
}

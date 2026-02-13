import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/supabase";
import type { BoardStatus } from "../types/poster-types";
import {
  countBoardsByStatus,
  createEmptyStatusCounts,
} from "../utils/poster-stats";

type PrefectureName = NonNullable<
  Database["public"]["Tables"]["poster_boards"]["Row"]["prefecture"]
>;

export type GetPosterBoardStatsResult =
  | {
      success: true;
      totalCount: number;
      statusCounts: Record<BoardStatus, number>;
    }
  | { success: false; error: string };

/**
 * 都道府県別のポスター掲示板統計情報を取得する
 * RPC関数を使用して最適化されたクエリを実行し、失敗時はフォールバックで個別カウントする
 */
export async function getPosterBoardStats(
  adminSupabase: SupabaseClient<Database>,
  prefecture: PrefectureName,
): Promise<GetPosterBoardStatsResult> {
  try {
    // 最適化されたRPC関数を使用
    const { data, error } = await adminSupabase.rpc(
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

      const statusCounts = createEmptyStatusCounts();

      // 並列でカウントクエリを実行
      const countPromises = statusTypes.map(async (status) => {
        const { count, error } = await adminSupabase
          .from("poster_boards")
          .select("*", { count: "exact", head: true })
          .eq("prefecture", prefecture)
          .eq("status", status)
          .eq("archived", false);

        if (error) {
          console.error(`Error counting ${status}:`, error);
          return { status, count: 0 };
        }

        return { status, count: count || 0 };
      });

      // 全件数のカウント
      const totalCountPromise = adminSupabase
        .from("poster_boards")
        .select("*", { count: "exact", head: true })
        .eq("prefecture", prefecture)
        .eq("archived", false);

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
        success: true,
        totalCount,
        statusCounts,
      };
    }

    // RPC成功時はデータを変換して返す
    if (data && data.length > 0) {
      const result = data[0];
      return {
        success: true,
        totalCount: Number(result.total_count) || 0,
        statusCounts: result.status_counts as Record<BoardStatus, number>,
      };
    }

    // データがない場合のデフォルト値
    return {
      success: true,
      totalCount: 0,
      statusCounts: createEmptyStatusCounts(),
    };
  } catch (error) {
    console.error("Error in getPosterBoardStats:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "統計情報の取得に失敗しました",
    };
  }
}

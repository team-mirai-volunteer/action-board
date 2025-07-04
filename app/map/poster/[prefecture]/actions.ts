"use server";

import {
  type Viewport,
  getPosterBoardsInViewport,
} from "@/lib/services/poster-boards-server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/supabase";

type BoardStatus = Database["public"]["Enums"]["poster_board_status"];
type PosterBoard = Database["public"]["Tables"]["poster_boards"]["Row"];

export interface FilterState {
  selectedStatuses: BoardStatus[];
  showOnlyMine: boolean;
}

/**
 * ビューポート変更時の動的データローディング
 */
export async function loadBoardsForViewport(
  prefecture: string,
  viewport: Viewport,
) {
  const boards = await getPosterBoardsInViewport(prefecture, viewport);
  return boards;
}

/**
 * フィルター適用時のデータ取得
 */
export async function filterPosterBoards(
  prefecture: string,
  viewport: Viewport,
  filters: FilterState,
) {
  const supabase = await createClient();

  let query = supabase
    .from("poster_boards")
    .select("*")
    .eq("prefecture", prefecture)
    .gte("lat", viewport.south)
    .lte("lat", viewport.north)
    .gte("long", viewport.west)
    .lte("long", viewport.east);

  // ステータスフィルター
  if (filters.selectedStatuses.length > 0) {
    query = query.in("status", filters.selectedStatuses);
  }

  // 自分が編集したもののみ表示
  if (filters.showOnlyMine) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // 編集履歴から自分が編集した掲示板IDを取得
      const { data: historyData } = await supabase
        .from("poster_board_status_history")
        .select("board_id")
        .eq("user_id", user.id);

      if (historyData && historyData.length > 0) {
        const boardIds = [...new Set(historyData.map((h) => h.board_id))];
        query = query.in("id", boardIds);
      } else {
        // 編集履歴がない場合は空の結果を返す
        return [];
      }
    }
  }

  const { data, error } = await query.limit(500);

  if (error) {
    console.error("Error filtering poster boards:", error);
    return [];
  }

  return data || [];
}

/**
 * ポスター掲示板の最新編集者情報を取得
 */
export async function getBoardsLatestEditorForViewport(
  boardIds: string[],
): Promise<Map<string, string | null>> {
  const supabase = await createClient();
  const editorMap = new Map<string, string | null>();

  if (boardIds.length === 0) {
    return editorMap;
  }

  // バッチ処理で効率的に取得
  const batchSize = 100;
  for (let i = 0; i < boardIds.length; i += batchSize) {
    const batch = boardIds.slice(i, i + batchSize);

    const { data: historyData } = await supabase
      .from("poster_board_status_history")
      .select("board_id, user_id, created_at")
      .in("board_id", batch)
      .order("created_at", { ascending: false });

    if (historyData) {
      // 各掲示板の最新編集者を特定
      const latestByBoard = new Map<
        string,
        { user_id: string; created_at: string }
      >();

      for (const record of historyData) {
        const existing = latestByBoard.get(record.board_id);
        if (!existing || record.created_at > existing.created_at) {
          latestByBoard.set(record.board_id, {
            user_id: record.user_id,
            created_at: record.created_at,
          });
        }
      }

      // editorMapに追加
      for (const [boardId, { user_id }] of latestByBoard) {
        editorMap.set(boardId, user_id);
      }
    }
  }

  // 編集履歴がない掲示板はnullを設定
  for (const boardId of boardIds) {
    if (!editorMap.has(boardId)) {
      editorMap.set(boardId, null);
    }
  }

  return editorMap;
}

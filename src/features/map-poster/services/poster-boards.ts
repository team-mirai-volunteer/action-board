import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/supabase";
import { getPosterBoardStatsAction } from "../actions/poster-boards";
import type {
  BoardStatus,
  PosterBoard,
  PosterBoardTotal,
} from "../types/poster-types";

// 最小限のデータのみ取得（マップ表示用）
export async function getPosterBoardsMinimal(prefecture?: string) {
  const supabase = createClient();

  // 全データを取得するためページネーションを使用
  const allBoards: Pick<
    PosterBoard,
    "id" | "lat" | "long" | "status" | "name" | "address" | "city" | "number"
  >[] = [];
  let hasMore = true;
  let rangeStart = 0;
  const pageSize = 5000; // 5000件ずつ取得

  while (hasMore) {
    let query = supabase
      .from("poster_boards")
      .select("id,lat,long,status,name,address,city,number")
      .range(rangeStart, rangeStart + pageSize - 1)
      .order("id", { ascending: true }); // 一貫した順序を保証

    if (prefecture) {
      query = query.eq(
        "prefecture",
        prefecture as Database["public"]["Enums"]["poster_prefecture_enum"],
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching poster boards:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allBoards.push(...data);

      // 取得したデータが pageSize より少ない場合は最後のページ
      if (data.length < pageSize) {
        hasMore = false;
      } else {
        rangeStart += pageSize;
      }
    }
  }

  return allBoards;
}

// 全データ取得（既存の関数名を維持）
export async function getPosterBoards(prefecture?: string) {
  const supabase = createClient();

  // Fetch all boards with pagination to bypass Supabase's default limit
  let allBoards: PosterBoard[] = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    let query = supabase
      .from("poster_boards")
      .select("*")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (prefecture) {
      query = query.eq(
        "prefecture",
        prefecture as Database["public"]["Enums"]["poster_prefecture_enum"],
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching poster boards:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    allBoards = [...allBoards, ...data];

    if (data.length < pageSize) {
      break;
    }

    page++;
  }

  return allBoards;
}

// 個別の掲示板の詳細を取得
export async function getPosterBoardDetail(
  boardId: string,
): Promise<PosterBoard | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("poster_boards")
    .select("*")
    .eq("id", boardId)
    .single();

  if (error) {
    console.error("Error fetching poster board detail:", error);
    return null;
  }

  return data;
}

export async function updateBoardStatus(
  boardId: string,
  newStatus: BoardStatus,
  note?: string,
) {
  const supabase = createClient();

  // Get current board status
  const { data: currentBoard, error: fetchError } = await supabase
    .from("poster_boards")
    .select("status")
    .eq("id", boardId)
    .single();

  if (fetchError) {
    console.error("Error fetching current board status:", fetchError);
    throw fetchError;
  }

  // Update board status
  const { error: updateError } = await supabase
    .from("poster_boards")
    .update({ status: newStatus })
    .eq("id", boardId);

  if (updateError) {
    console.error("Error updating board status:", updateError);
    throw updateError;
  }

  // Get current user - required for history tracking
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to update board status");
  }

  // Insert history record
  const { error: historyError } = await supabase
    .from("poster_board_status_history")
    .insert({
      board_id: boardId,
      user_id: user.id,
      previous_status: currentBoard.status,
      new_status: newStatus,
      note: note || null,
    });

  if (historyError) {
    console.error("Error inserting status history:", historyError);
    throw historyError;
  }

  return { success: true };
}

// Get unique prefectures that have poster boards
export async function getPrefecturesWithBoards() {
  const supabase = createClient();

  // Fetch all records with pagination to get all prefectures
  let allPrefectures: string[] = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("poster_boards")
      .select("prefecture")
      .not("prefecture", "is", null)
      .order("prefecture")
      .order("id", { ascending: true })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Error fetching prefectures:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    allPrefectures = [
      ...allPrefectures,
      ...data.map((item) => item.prefecture).filter(Boolean),
    ];

    if (data.length < pageSize) {
      break;
    }

    page++;
  }

  // Get unique prefectures
  const uniquePrefectures = Array.from(new Set(allPrefectures));

  return uniquePrefectures;
}

// 統計情報を取得（RPC関数を使用して最適化）
export async function getPosterBoardStats(prefecture: string): Promise<{
  totalCount: number;
  statusCounts: Record<BoardStatus, number>;
}> {
  // RPC関数を使用した最適化された実装を呼び出す
  return getPosterBoardStatsAction(
    prefecture as Database["public"]["Enums"]["poster_prefecture_enum"],
  );
}

// 選挙管理委員会から提供された掲示板総数を取得
export async function getPosterBoardTotals(
  electionId?: string,
): Promise<PosterBoardTotal[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("poster_board_totals")
    .select("*")
    .order("prefecture", { ascending: true });

  if (error) {
    console.error("Error fetching poster board totals:", error);
    throw error;
  }

  return data || [];
}

// 都道府県別の統計情報のみを取得（集計済みデータ）
export async function getPosterBoardSummaryByPrefecture(
  electionId?: string,
): Promise<
  Record<string, { total: number; statuses: Record<BoardStatus, number> }>
> {
  const supabase = createClient();

  // RPC関数を使用してデータベース側で集計
  const { data: aggregatedData, error: rpcError } = await supabase.rpc(
    "get_poster_board_stats",
    { election_id_param: electionId || undefined },
  );

  if (rpcError) {
    console.error("Error calling RPC function:", rpcError);
    throw rpcError;
  }

  if (!aggregatedData) {
    return {};
  }

  // RPC関数から返されたデータを整形
  const summary: Record<
    string,
    { total: number; statuses: Record<BoardStatus, number> }
  > = {};

  for (const row of aggregatedData) {
    const prefecture = row.prefecture;
    if (!summary[prefecture]) {
      summary[prefecture] = {
        total: 0,
        statuses: {
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
    summary[prefecture].statuses[row.status] = row.count;
    summary[prefecture].total += row.count;
  }

  return summary;
}

// 特定の都道府県の掲示板総数を取得
export async function getPosterBoardTotalByPrefecture(
  prefecture: string,
): Promise<PosterBoardTotal | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("poster_board_totals")
    .select("*")
    .eq(
      "prefecture",
      prefecture as Database["public"]["Enums"]["poster_prefecture_enum"],
    )
    .is("city", null) // 都道府県レベルのデータのみ
    .single();

  if (error) {
    console.error("Error fetching poster board total for prefecture:", error);
    return null;
  }

  return data;
}

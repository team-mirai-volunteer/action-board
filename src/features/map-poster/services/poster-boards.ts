import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/supabase";
import { getPosterBoardStatsAction } from "../actions/poster-boards";
import type {
  BoardStatus,
  PosterBoard,
  PosterBoardTotal,
} from "../types/poster-types";

/**
 * 現在アクティブな選挙期間
 * 新しい選挙期間に移行する場合はこの値を変更する
 */
export const CURRENT_ELECTION_TERM = "shugin-2026";

/**
 * 現在の認証ユーザーIDを取得
 */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * ポスター貼りミッションのIDを取得
 */
export async function getPosterMissionId(): Promise<string | null> {
  const supabase = createClient();

  const { data: mission, error } = await supabase
    .from("missions")
    .select("id")
    .eq("slug", "put-up-poster-on-board")
    .single();

  if (error) {
    console.error("Error fetching poster mission:", error);
    return null;
  }

  return mission?.id ?? null;
}

/**
 * 特定の掲示板でユーザーがミッション達成済みかチェック
 */
export async function checkBoardMissionCompleted(
  boardId: string,
  userId: string,
): Promise<boolean> {
  const missionId = await getPosterMissionId();
  if (!missionId) return false;

  const supabase = createClient();

  const { data: activities, error } = await supabase
    .from("poster_activities")
    .select(
      `
      id,
      mission_artifacts!inner(
        achievements!inner(
          mission_id,
          user_id
        )
      )
    `,
    )
    .eq("board_id", boardId)
    .eq("mission_artifacts.achievements.user_id", userId)
    .eq("mission_artifacts.achievements.mission_id", missionId);

  if (error) {
    console.error("Error checking board mission completion:", error);
    return false;
  }

  return (activities?.length ?? 0) > 0;
}

// 最小限のデータのみ取得（マップ表示用）- 区割り対応版
export async function getPosterBoardsMinimalByDistrict(district: string) {
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
    const { data, error } = await supabase
      .from("poster_boards")
      .select("id,lat,long,status,name,address,city,number")
      .eq("district", district)
      .eq("archived", false)
      .eq("election_term", CURRENT_ELECTION_TERM)
      .range(rangeStart, rangeStart + pageSize - 1)
      .order("id", { ascending: true }); // 一貫した順序を保証

    if (error) {
      console.error("Error fetching poster boards by district:", error);
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

// 最小限のデータのみ取得（マップ表示用）- レガシー都道府県版
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
      .eq("archived", false)
      .eq("election_term", CURRENT_ELECTION_TERM)
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

// 全データ取得（既存の関数名を維持）- レガシー都道府県版
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
      .eq("archived", false)
      .eq("election_term", CURRENT_ELECTION_TERM)
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

// 全データ取得 - 区割り対応版
export async function getPosterBoardsByDistrict(district: string) {
  const supabase = createClient();

  // Fetch all boards with pagination to bypass Supabase's default limit
  let allBoards: PosterBoard[] = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("poster_boards")
      .select("*")
      .eq("district", district)
      .eq("archived", false)
      .eq("election_term", CURRENT_ELECTION_TERM)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Error fetching poster boards by district:", error);
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

// Get unique prefectures that have poster boards (legacy)
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
      .eq("archived", false)
      .eq("election_term", CURRENT_ELECTION_TERM)
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

// Get unique districts that have poster boards (区割り対応版)
export async function getDistrictsWithBoards(): Promise<string[]> {
  const supabase = createClient();

  // Fetch all records with pagination to get all districts
  let allDistricts: string[] = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("poster_boards")
      .select("district")
      .not("district", "is", null)
      .eq("archived", false)
      .eq("election_term", CURRENT_ELECTION_TERM)
      .order("district")
      .order("id", { ascending: true })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Error fetching districts:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    allDistricts = [
      ...allDistricts,
      ...data
        .map((item) => item.district)
        .filter((d): d is string => d !== null),
    ];

    if (data.length < pageSize) {
      break;
    }

    page++;
  }

  // Get unique districts
  const uniqueDistricts = Array.from(new Set(allDistricts));

  return uniqueDistricts;
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
export async function getPosterBoardTotals(): Promise<PosterBoardTotal[]> {
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
export async function getPosterBoardSummaryByPrefecture(): Promise<
  Record<string, { total: number; statuses: Record<BoardStatus, number> }>
> {
  const supabase = createClient();

  // RPC関数を使用してデータベース側で集計
  const { data: aggregatedData, error: rpcError } = await supabase.rpc(
    "get_poster_board_stats",
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

// 区割り別の統計情報を取得（集計済みデータ）
export async function getPosterBoardSummaryByDistrict(): Promise<
  Record<string, { total: number; statuses: Record<BoardStatus, number> }>
> {
  const supabase = createClient();

  // 区割りでグループ化して集計
  // archived=false かつ現在の選挙期間のデータのみを対象
  const { data, error } = await supabase
    .from("poster_boards")
    .select("district, status")
    .not("district", "is", null)
    .eq("archived", false)
    .eq("election_term", CURRENT_ELECTION_TERM);

  if (error) {
    console.error("Error fetching district summary:", error);
    throw error;
  }

  if (!data) {
    return {};
  }

  // データを整形
  const summary: Record<
    string,
    { total: number; statuses: Record<BoardStatus, number> }
  > = {};

  for (const row of data) {
    const district = row.district;
    if (!district) continue;

    if (!summary[district]) {
      summary[district] = {
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
    summary[district].statuses[row.status] += 1;
    summary[district].total += 1;
  }

  return summary;
}

// 区割り別の統計情報を取得（特定の区割り）
export async function getPosterBoardStatsByDistrict(district: string): Promise<{
  totalCount: number;
  statusCounts: Record<BoardStatus, number>;
}> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("poster_boards")
    .select("status")
    .eq("district", district)
    .eq("archived", false)
    .eq("election_term", CURRENT_ELECTION_TERM);

  if (error) {
    console.error("Error fetching district stats:", error);
    throw error;
  }

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

  for (const row of data || []) {
    statusCounts[row.status] += 1;
  }

  const totalCount = data?.length || 0;

  return { totalCount, statusCounts };
}

// ===== Archive Functions =====

// Get available archived election terms
export async function getArchivedElectionTerms(): Promise<string[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("poster_boards")
    .select("election_term")
    .eq("archived", true)
    .not("election_term", "is", null);

  if (error) {
    console.error("Error fetching archived election terms:", error);
    throw error;
  }

  // Get unique election terms
  const uniqueTerms = Array.from(
    new Set(
      data
        ?.map((item) => item.election_term)
        .filter((t): t is string => t !== null) || [],
    ),
  );

  return uniqueTerms;
}

// Get archived data summary by prefecture for a specific election term
export async function getArchivedPosterBoardSummary(
  electionTerm: string,
): Promise<
  Record<string, { total: number; statuses: Record<BoardStatus, number> }>
> {
  const supabase = createClient();

  // Use RPC function to avoid 10,000 row limit by doing server-side aggregation
  const { data, error } = await supabase.rpc(
    "get_archived_poster_board_stats",
    {
      p_election_term: electionTerm,
    },
  );

  if (error) {
    console.error("Error fetching archived summary:", error);
    throw error;
  }

  // データを整形
  const summary: Record<
    string,
    { total: number; statuses: Record<BoardStatus, number> }
  > = {};

  if (data && Array.isArray(data)) {
    for (const row of data) {
      const prefecture = row.prefecture;
      if (!prefecture) continue;

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
      summary[prefecture].statuses[row.status as BoardStatus] = row.count;
      summary[prefecture].total += row.count;
    }
  }

  return summary;
}

// Get archived poster boards minimal data for a specific election term and prefecture
export async function getArchivedPosterBoardsMinimal(
  electionTerm: string,
  prefecture: string,
) {
  const supabase = createClient();

  const allBoards: Pick<
    PosterBoard,
    "id" | "lat" | "long" | "status" | "name" | "address" | "city" | "number"
  >[] = [];
  let hasMore = true;
  let rangeStart = 0;
  const pageSize = 5000;

  while (hasMore) {
    const { data, error } = await supabase
      .from("poster_boards")
      .select("id,lat,long,status,name,address,city,number")
      .eq("election_term", electionTerm)
      .eq(
        "prefecture",
        prefecture as Database["public"]["Enums"]["poster_prefecture_enum"],
      )
      .eq("archived", true)
      .range(rangeStart, rangeStart + pageSize - 1)
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching archived poster boards:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allBoards.push(...data);
      if (data.length < pageSize) {
        hasMore = false;
      } else {
        rangeStart += pageSize;
      }
    }
  }

  return allBoards;
}

// Get archived poster board stats for a specific election term and prefecture
export async function getArchivedPosterBoardStats(
  electionTerm: string,
  prefecture: string,
): Promise<{
  totalCount: number;
  statusCounts: Record<BoardStatus, number>;
}> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("poster_boards")
    .select("status")
    .eq("election_term", electionTerm)
    .eq(
      "prefecture",
      prefecture as Database["public"]["Enums"]["poster_prefecture_enum"],
    )
    .eq("archived", true);

  if (error) {
    console.error("Error fetching archived stats:", error);
    throw error;
  }

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

  for (const row of data || []) {
    statusCounts[row.status] += 1;
  }

  const totalCount = data?.length || 0;

  return { totalCount, statusCounts };
}

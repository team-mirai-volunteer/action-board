import "server-only";

import { createAdminClient } from "@/lib/supabase/adminClient";
import type { Database } from "@/lib/types/supabase";
import { POSTER_MISSION_SLUG } from "../constants/poster-mission";
import type {
  BoardStatus,
  PosterBoard,
  PosterBoardTotal,
} from "../types/poster-types";
import { getPosterBoardStats as getPosterBoardStatsUseCase } from "../use-cases/get-poster-board-stats";
import {
  buildSummaryFromAggregatedRows,
  buildSummaryFromIndividualRows,
  extractUniqueValues,
} from "../utils/board-transforms";
import {
  countBoardsByStatus,
  createEmptyStatusCounts,
} from "../utils/poster-stats";

/**
 * ポスター貼りミッションのIDを取得
 */
export async function getPosterMissionId(): Promise<string | null> {
  const supabase = await createAdminClient();

  const { data: mission, error } = await supabase
    .from("missions")
    .select("id")
    .eq("slug", POSTER_MISSION_SLUG)
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

  const supabase = await createAdminClient();

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
  const supabase = await createAdminClient();

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
      .not("lat", "is", null) // 座標なしを除外
      .not("long", "is", null) // 座標なしを除外
      .eq("archived", false)
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
  const supabase = await createAdminClient();

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
  const supabase = await createAdminClient();

  // Fetch all boards with pagination to bypass Supabase's default limit
  let allBoards: PosterBoard[] = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    let query = supabase
      .from("poster_boards")
      .select("*")
      .eq("archived", false)
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
  const supabase = await createAdminClient();

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
  const supabase = await createAdminClient();

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

// Get unique prefectures that have poster boards (legacy)
export async function getPrefecturesWithBoards() {
  const supabase = await createAdminClient();

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
  return extractUniqueValues(allPrefectures, (p) => p);
}

// Get unique districts that have poster boards (区割り対応版)
export async function getDistrictsWithBoards(): Promise<string[]> {
  const supabase = await createAdminClient();

  // Fetch all records with pagination to get all districts
  let allDistricts: string[] = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("poster_boards")
      .select("district")
      .not("district", "is", null)
      .not("lat", "is", null) // 座標なしを除外
      .not("long", "is", null) // 座標なしを除外
      .eq("archived", false)
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
  return extractUniqueValues(allDistricts, (d) => d);
}

// 統計情報を取得（RPC関数を使用して最適化）
export async function getPosterBoardStats(prefecture: string): Promise<{
  totalCount: number;
  statusCounts: Record<BoardStatus, number>;
}> {
  const supabase = await createAdminClient();
  const result = await getPosterBoardStatsUseCase(
    supabase,
    prefecture as Database["public"]["Enums"]["poster_prefecture_enum"],
  );

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

// 都道府県別の統計情報のみを取得（集計済みデータ）
export async function getPosterBoardSummaryByPrefecture(): Promise<
  Record<string, { total: number; statuses: Record<BoardStatus, number> }>
> {
  const supabase = await createAdminClient();

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
  return buildSummaryFromAggregatedRows(
    aggregatedData,
    (row) => row.prefecture,
  );
}

// 特定の都道府県の掲示板総数を取得
export async function getPosterBoardTotalByPrefecture(
  prefecture: string,
): Promise<PosterBoardTotal | null> {
  const supabase = await createAdminClient();

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
  const supabase = await createAdminClient();

  // 区割りでグループ化して集計
  // archived=false のデータのみを対象
  const { data, error } = await supabase
    .from("poster_boards")
    .select("district, status")
    .not("district", "is", null)
    .not("lat", "is", null) // 座標なしを除外
    .not("long", "is", null) // 座標なしを除外
    .eq("archived", false);

  if (error) {
    console.error("Error fetching district summary:", error);
    throw error;
  }

  if (!data) {
    return {};
  }

  // データを整形
  return buildSummaryFromIndividualRows(data, (row) => row.district);
}

// 区割り別の統計情報を取得（特定の区割り）
export async function getPosterBoardStatsByDistrict(district: string): Promise<{
  totalCount: number;
  statusCounts: Record<BoardStatus, number>;
}> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("poster_boards")
    .select("status")
    .eq("district", district)
    .not("lat", "is", null) // 座標なしを除外
    .not("long", "is", null) // 座標なしを除外
    .eq("archived", false);

  if (error) {
    console.error("Error fetching district stats:", error);
    throw error;
  }

  const statusCounts = countBoardsByStatus(data || []);
  const totalCount = data?.length || 0;

  return { totalCount, statusCounts };
}

// ===== Archive Functions =====

// Get available archived election terms
export async function getArchivedElectionTerms(): Promise<string[]> {
  const supabase = await createAdminClient();

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
  return extractUniqueValues(data || [], (item) => item.election_term);
}

// Get archived data summary by prefecture for a specific election term
export async function getArchivedPosterBoardSummary(
  electionTerm: string,
): Promise<
  Record<string, { total: number; statuses: Record<BoardStatus, number> }>
> {
  const supabase = await createAdminClient();

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
  if (!data || !Array.isArray(data)) {
    return {};
  }

  return buildSummaryFromAggregatedRows(data, (row) => row.prefecture);
}

// Get archived poster boards minimal data for a specific election term and prefecture
export async function getArchivedPosterBoardsMinimal(
  electionTerm: string,
  prefecture: string,
) {
  const supabase = await createAdminClient();

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
  const supabase = await createAdminClient();

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

  const statusCounts = countBoardsByStatus(data || []);
  const totalCount = data?.length || 0;

  return { totalCount, statusCounts };
}

// ===== User Reservation Stats =====

export interface UserReservationStats {
  userId: string;
  userName: string;
  reservedCount: number;
  completedCount: number;
}

/**
 * ユーザー別の予約/完了統計を取得
 * 現在アクティブな（アーカイブされていない）掲示板のみを対象
 * @param district - 区割り名（日本語）。指定すると、その区割りのみの統計を取得
 */
export async function getUserReservationStats(
  district?: string,
): Promise<UserReservationStats[]> {
  const supabase = createClient();

  // まず、アクティブな掲示板のIDを取得
  let boardsQuery = supabase
    .from("poster_boards")
    .select("id")
    .eq("archived", false);

  if (district) {
    boardsQuery = boardsQuery.eq("district", district);
  }

  const { data: activeBoards, error: boardsError } = await boardsQuery;

  if (boardsError) {
    console.error("Error fetching active boards:", boardsError);
    throw boardsError;
  }

  const activeBoardIds = activeBoards?.map((b) => b.id) || [];

  if (activeBoardIds.length === 0) {
    return [];
  }

  // 履歴データを取得（アクティブな掲示板のみ）
  // ページネーションで全件取得
  let allHistory: {
    board_id: string;
    user_id: string;
    new_status: BoardStatus;
  }[] = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data: historyData, error: historyError } = await supabase
      .from("poster_board_status_history")
      .select("board_id, user_id, new_status")
      .in("board_id", activeBoardIds)
      .in("new_status", ["reserved", "done"])
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (historyError) {
      console.error("Error fetching history:", historyError);
      throw historyError;
    }

    if (!historyData || historyData.length === 0) {
      break;
    }

    allHistory = [...allHistory, ...historyData];

    if (historyData.length < pageSize) {
      break;
    }
    page++;
  }

  if (allHistory.length === 0) {
    return [];
  }

  // ユーザーごとにユニークな掲示板をカウント
  const userStats = new Map<
    string,
    { reservedBoards: Set<string>; completedBoards: Set<string> }
  >();

  for (const record of allHistory) {
    let stats = userStats.get(record.user_id);
    if (!stats) {
      stats = {
        reservedBoards: new Set(),
        completedBoards: new Set(),
      };
      userStats.set(record.user_id, stats);
    }

    if (record.new_status === "reserved") {
      stats.reservedBoards.add(record.board_id);
    } else if (record.new_status === "done") {
      stats.completedBoards.add(record.board_id);
    }
  }

  // ユーザー情報を取得
  const userIds = Array.from(userStats.keys());
  const { data: userData, error: userError } = await supabase
    .from("public_user_profiles")
    .select("id, name")
    .in("id", userIds);

  if (userError) {
    console.error("Error fetching user profiles:", userError);
    throw userError;
  }

  const userMap = new Map(userData?.map((u) => [u.id, u.name]) || []);

  // 結果を整形
  const result: UserReservationStats[] = [];
  for (const [userId, stats] of Array.from(userStats.entries())) {
    result.push({
      userId,
      userName: userMap.get(userId) || "不明なユーザー",
      reservedCount: stats.reservedBoards.size,
      completedCount: stats.completedBoards.size,
    });
  }

  // 予約数でソート（多い順）
  result.sort((a, b) => b.reservedCount - a.reservedCount);

  return result;
}

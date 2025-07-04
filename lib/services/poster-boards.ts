import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/supabase";

type PosterBoard = Database["public"]["Tables"]["poster_boards"]["Row"];
type BoardStatus = Database["public"]["Enums"]["poster_board_status"];
type StatusHistory =
  Database["public"]["Tables"]["poster_board_status_history"]["Row"];

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

export async function getBoardStatusHistory(boardId: string) {
  const supabase = createClient();

  const { data: historyData, error } = await supabase
    .from("poster_board_status_history")
    .select("*")
    .eq("board_id", boardId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching status history:", error);
    throw error;
  }

  // Fetch user profiles for each history entry
  const userIds = Array.from(new Set(historyData?.map((h) => h.user_id) || []));
  const { data: users } = await supabase
    .from("public_user_profiles")
    .select("id, name, address_prefecture")
    .in("id", userIds);

  // Combine history with user data
  const data =
    historyData?.map((history) => ({
      ...history,
      user: users?.find((u) => u.id === history.user_id) || null,
    })) || [];

  return data;
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

// Get the user IDs who made the latest status change for each board
export async function getBoardsLatestEditor(boardIds: string[]) {
  const supabase = createClient();
  const editorMap = new Map<string, string | null>();

  // Process in batches to avoid query limits
  const batchSize = 100;
  for (let i = 0; i < boardIds.length; i += batchSize) {
    const batch = boardIds.slice(i, i + batchSize);

    const { data, error } = await supabase
      .from("poster_board_status_history")
      .select("board_id, user_id, created_at")
      .in("board_id", batch)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching latest editor info:", error);
      continue;
    }

    // Group by board_id and get the latest edit for each
    const latestEdits = new Map<
      string,
      { user_id: string; created_at: string }
    >();

    for (const record of data || []) {
      const existing = latestEdits.get(record.board_id);
      if (!existing || record.created_at > existing.created_at) {
        latestEdits.set(record.board_id, {
          user_id: record.user_id,
          created_at: record.created_at,
        });
      }
    }

    // Add to the result map
    for (const [boardId, { user_id }] of latestEdits) {
      editorMap.set(boardId, user_id);
    }
  }

  return editorMap;
}

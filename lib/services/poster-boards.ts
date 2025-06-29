import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/supabase";

type PosterBoard = Database["public"]["Tables"]["poster_boards"]["Row"];
type BoardStatus = Database["public"]["Enums"]["poster_board_status"];
type StatusHistory =
  Database["public"]["Tables"]["poster_board_status_history"]["Row"];

export async function getPosterBoards(prefecture?: string) {
  const supabase = createClient();

  let query = supabase
    .from("poster_boards")
    .select("*")
    .order("created_at", { ascending: false });

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

  const { data, error } = await supabase
    .from("poster_boards")
    .select("prefecture")
    .not("prefecture", "is", null)
    .order("prefecture");

  if (error) {
    console.error("Error fetching prefectures:", error);
    throw error;
  }

  // Get unique prefectures
  const uniquePrefectures = Array.from(
    new Set(data.map((item) => item.prefecture).filter(Boolean)),
  );

  return uniquePrefectures;
}

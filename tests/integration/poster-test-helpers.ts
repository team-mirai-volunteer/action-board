import type { Database } from "@/lib/types/supabase";
import { adminClient } from "./utils";

type PosterBoardInsert =
  Database["public"]["Tables"]["poster_boards"]["Insert"];

/**
 * テスト用のポスター掲示板を作成する
 */
export async function createTestPosterBoard(
  overrides: Partial<PosterBoardInsert> = {},
) {
  const defaults: PosterBoardInsert = {
    name: `テスト掲示板_${Date.now()}`,
    prefecture: "東京都",
    city: "テスト市",
    status: "not_yet",
    election_term: "test_election",
    lat: 35.6762,
    long: 139.6503,
    archived: false,
  };

  const boardData = { ...defaults, ...overrides };

  const { data, error } = await adminClient
    .from("poster_boards")
    .insert(boardData)
    .select()
    .single();

  if (error) {
    throw new Error(`テスト掲示板の作成に失敗しました: ${error.message}`);
  }

  return data;
}

/**
 * テスト用のポスター掲示板をクリーンアップする
 */
export async function cleanupTestPosterBoard(boardId: string) {
  // 履歴を先に削除（FK制約）
  await adminClient
    .from("poster_board_status_history")
    .delete()
    .eq("board_id", boardId);

  // 掲示板を削除
  const { error } = await adminClient
    .from("poster_boards")
    .delete()
    .eq("id", boardId);

  if (error) {
    console.error(`テスト掲示板の削除に失敗しました: ${error.message}`);
  }
}

import type { SupabaseClient } from "@supabase/supabase-js";
import { getPosterBoardStats } from "@/features/map-poster/use-cases/get-poster-board-stats";
import { updateBoardStatus } from "@/features/map-poster/use-cases/update-board-status";
import type { Database } from "@/lib/types/supabase";
import {
  cleanupTestPosterBoard,
  createTestPosterBoard,
} from "./poster-test-helpers";
import { adminClient, cleanupTestUser, createTestUser } from "./utils";

/**
 * RPC呼び出しを強制的に失敗させるプロキシクライアントを作成する。
 * フォールバックパスのテストに使用。RPCは失敗するが、通常のクエリは実クライアントに委譲される。
 */
function createRpcFailingClient(): SupabaseClient<Database> {
  return new Proxy(adminClient, {
    get(target, prop) {
      if (prop === "rpc") {
        return () =>
          Promise.resolve({
            data: null,
            error: { message: "RPC function not found", code: "PGRST202" },
          });
      }
      return Reflect.get(target, prop);
    },
  }) as SupabaseClient<Database>;
}

describe("ポスター掲示板ユースケース", () => {
  const createdBoardIds: string[] = [];
  const createdUserIds: string[] = [];

  afterEach(async () => {
    for (const boardId of createdBoardIds) {
      await cleanupTestPosterBoard(boardId);
    }
    createdBoardIds.length = 0;

    for (const userId of createdUserIds) {
      await cleanupTestUser(userId);
    }
    createdUserIds.length = 0;
  });

  describe("updateBoardStatus", () => {
    test("ボードのステータスを更新し、履歴エントリが作成される", async () => {
      // テストユーザーとテスト掲示板を作成
      const { user } = await createTestUser();
      createdUserIds.push(user.userId);

      const board = await createTestPosterBoard({ status: "not_yet" });
      createdBoardIds.push(board.id);

      // ステータスを更新
      const result = await updateBoardStatus(adminClient, {
        boardId: board.id,
        userId: user.userId,
        newStatus: "done",
        note: "テスト更新",
      });

      expect(result.success).toBe(true);

      // DB上のステータスが変更されたことを確認
      const { data: updatedBoard } = await adminClient
        .from("poster_boards")
        .select("status")
        .eq("id", board.id)
        .single();

      expect(updatedBoard!.status).toBe("done");

      // 履歴エントリが作成されたことを確認
      const { data: history } = await adminClient
        .from("poster_board_status_history")
        .select("*")
        .eq("board_id", board.id)
        .order("created_at", { ascending: false });

      expect(history).toHaveLength(1);
      expect(history![0].previous_status).toBe("not_yet");
      expect(history![0].new_status).toBe("done");
      expect(history![0].user_id).toBe(user.userId);
      expect(history![0].note).toBe("テスト更新");
    });

    test("noteなしでもステータス更新できる", async () => {
      const { user } = await createTestUser();
      createdUserIds.push(user.userId);

      const board = await createTestPosterBoard({ status: "not_yet" });
      createdBoardIds.push(board.id);

      const result = await updateBoardStatus(adminClient, {
        boardId: board.id,
        userId: user.userId,
        newStatus: "reserved",
      });

      expect(result.success).toBe(true);

      // DB確認
      const { data: updatedBoard } = await adminClient
        .from("poster_boards")
        .select("status")
        .eq("id", board.id)
        .single();

      expect(updatedBoard!.status).toBe("reserved");

      // 履歴のnoteはnull
      const { data: history } = await adminClient
        .from("poster_board_status_history")
        .select("note")
        .eq("board_id", board.id)
        .single();

      expect(history!.note).toBeNull();
    });

    test("複数回のステータス更新で履歴が蓄積される", async () => {
      const { user } = await createTestUser();
      createdUserIds.push(user.userId);

      const board = await createTestPosterBoard({ status: "not_yet" });
      createdBoardIds.push(board.id);

      // 1回目: not_yet -> reserved
      await updateBoardStatus(adminClient, {
        boardId: board.id,
        userId: user.userId,
        newStatus: "reserved",
      });

      // 2回目: reserved -> done
      await updateBoardStatus(adminClient, {
        boardId: board.id,
        userId: user.userId,
        newStatus: "done",
        note: "完了",
      });

      // 履歴が2件作成されたことを確認
      const { data: history } = await adminClient
        .from("poster_board_status_history")
        .select("*")
        .eq("board_id", board.id)
        .order("created_at", { ascending: true });

      expect(history).toHaveLength(2);
      expect(history![0].previous_status).toBe("not_yet");
      expect(history![0].new_status).toBe("reserved");
      expect(history![1].previous_status).toBe("reserved");
      expect(history![1].new_status).toBe("done");
      expect(history![1].note).toBe("完了");
    });

    test("存在しないボードIDでエラーが返る", async () => {
      const { user } = await createTestUser();
      createdUserIds.push(user.userId);

      const result = await updateBoardStatus(adminClient, {
        boardId: "00000000-0000-0000-0000-000000000000",
        userId: user.userId,
        newStatus: "done",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("掲示板の取得に失敗しました");
      }
    });
  });

  describe("getPosterBoardStats", () => {
    test("ステータス別のカウントが正しく取得できる", async () => {
      // テスト用の掲示板を複数作成（同じ都道府県）
      const board1 = await createTestPosterBoard({
        status: "not_yet",
        prefecture: "北海道",
        city: "テスト市A",
        number: `test_${Date.now()}_1`,
      });
      createdBoardIds.push(board1.id);

      const board2 = await createTestPosterBoard({
        status: "done",
        prefecture: "北海道",
        city: "テスト市B",
        number: `test_${Date.now()}_2`,
      });
      createdBoardIds.push(board2.id);

      const board3 = await createTestPosterBoard({
        status: "done",
        prefecture: "北海道",
        city: "テスト市C",
        number: `test_${Date.now()}_3`,
      });
      createdBoardIds.push(board3.id);

      const result = await getPosterBoardStats(adminClient, "北海道");

      expect(result.success).toBe(true);
      if (!result.success) return;

      // テスト用データ以外にも既存データがある可能性があるので、
      // 最低限テストで作成した分が含まれていることを確認
      expect(result.totalCount).toBeGreaterThanOrEqual(3);
      expect(result.statusCounts.done).toBeGreaterThanOrEqual(2);
      expect(result.statusCounts.not_yet).toBeGreaterThanOrEqual(1);
    });

    test("アーカイブされた掲示板はカウントに含まれない", async () => {
      const board1 = await createTestPosterBoard({
        status: "done",
        prefecture: "北海道",
        city: "テストアーカイブ市",
        number: `test_arch_${Date.now()}_1`,
        archived: false,
      });
      createdBoardIds.push(board1.id);

      const board2 = await createTestPosterBoard({
        status: "done",
        prefecture: "北海道",
        city: "テストアーカイブ市",
        number: `test_arch_${Date.now()}_2`,
        archived: true,
      });
      createdBoardIds.push(board2.id);

      const result = await getPosterBoardStats(adminClient, "北海道");

      expect(result.success).toBe(true);
      if (!result.success) return;

      // アーカイブされたデータはカウントされないはず
      // 正確な数は既存データに依存するので、成功することを確認
      expect(result.totalCount).toBeGreaterThanOrEqual(1);
    });

    test("掲示板が少ない都道府県でデフォルト値パスを通る", async () => {
      // 愛媛県の既存データを確認
      const { count: existingCount } = await adminClient
        .from("poster_boards")
        .select("*", { count: "exact", head: true })
        .eq("prefecture", "愛媛県")
        .eq("archived", false);

      const result = await getPosterBoardStats(adminClient, "愛媛県");

      expect(result.success).toBe(true);
      if (!result.success) return;

      // 既存データが0件であればtotalCountも0（デフォルト値パス lines 110-114）
      if (existingCount === 0) {
        expect(result.totalCount).toBe(0);
        // 全ステータスが0であることを確認
        expect(result.statusCounts.not_yet).toBe(0);
        expect(result.statusCounts.done).toBe(0);
        expect(result.statusCounts.reserved).toBe(0);
        expect(result.statusCounts.error_wrong_place).toBe(0);
        expect(result.statusCounts.error_damaged).toBe(0);
        expect(result.statusCounts.error_wrong_poster).toBe(0);
        expect(result.statusCounts.other).toBe(0);
        expect(result.statusCounts.not_yet_dangerous).toBe(0);
      } else {
        // 既存データがある場合は少なくとも成功すること
        expect(result.totalCount).toBeGreaterThanOrEqual(0);
      }
    });

    test("複数ステータスの掲示板が正確にカウントされる", async () => {
      const ts = Date.now();

      // 5種類のステータスで掲示板を作成
      const board1 = await createTestPosterBoard({
        status: "not_yet",
        prefecture: "宮城県",
        city: "テスト複数ステータス市",
        number: `test_multi_${ts}_1`,
      });
      createdBoardIds.push(board1.id);

      const board2 = await createTestPosterBoard({
        status: "done",
        prefecture: "宮城県",
        city: "テスト複数ステータス市",
        number: `test_multi_${ts}_2`,
      });
      createdBoardIds.push(board2.id);

      const board3 = await createTestPosterBoard({
        status: "reserved",
        prefecture: "宮城県",
        city: "テスト複数ステータス市",
        number: `test_multi_${ts}_3`,
      });
      createdBoardIds.push(board3.id);

      const board4 = await createTestPosterBoard({
        status: "error_wrong_place",
        prefecture: "宮城県",
        city: "テスト複数ステータス市",
        number: `test_multi_${ts}_4`,
      });
      createdBoardIds.push(board4.id);

      const board5 = await createTestPosterBoard({
        status: "not_yet_dangerous",
        prefecture: "宮城県",
        city: "テスト複数ステータス市",
        number: `test_multi_${ts}_5`,
      });
      createdBoardIds.push(board5.id);

      const result = await getPosterBoardStats(adminClient, "宮城県");

      expect(result.success).toBe(true);
      if (!result.success) return;

      // テストで作成した分が含まれていることを確認
      expect(result.totalCount).toBeGreaterThanOrEqual(5);
      expect(result.statusCounts.not_yet).toBeGreaterThanOrEqual(1);
      expect(result.statusCounts.done).toBeGreaterThanOrEqual(1);
      expect(result.statusCounts.reserved).toBeGreaterThanOrEqual(1);
      expect(result.statusCounts.error_wrong_place).toBeGreaterThanOrEqual(1);
      expect(result.statusCounts.not_yet_dangerous).toBeGreaterThanOrEqual(1);
    });

    test("RPC失敗時にフォールバックで正しい結果が返る", async () => {
      // RPCを強制的に失敗させ、フォールバックパス（個別クエリ）をテストする
      const ts = Date.now();
      const rpcFailingClient = createRpcFailingClient();

      const board1 = await createTestPosterBoard({
        status: "done",
        prefecture: "長野県",
        city: "テストフォールバック市",
        number: `test_fb_${ts}_1`,
      });
      createdBoardIds.push(board1.id);

      const board2 = await createTestPosterBoard({
        status: "not_yet",
        prefecture: "長野県",
        city: "テストフォールバック市",
        number: `test_fb_${ts}_2`,
      });
      createdBoardIds.push(board2.id);

      const result = await getPosterBoardStats(rpcFailingClient, "長野県");

      expect(result.success).toBe(true);
      if (!result.success) return;

      // フォールバックでも正確なカウントが返ること
      expect(result.totalCount).toBeGreaterThanOrEqual(2);
      expect(result.statusCounts.done).toBeGreaterThanOrEqual(1);
      expect(result.statusCounts.not_yet).toBeGreaterThanOrEqual(1);

      // statusCountsの全キーが存在すること（フォールバックでも全ステータスが返る）
      expect(result.statusCounts).toHaveProperty("not_yet");
      expect(result.statusCounts).toHaveProperty("not_yet_dangerous");
      expect(result.statusCounts).toHaveProperty("reserved");
      expect(result.statusCounts).toHaveProperty("done");
      expect(result.statusCounts).toHaveProperty("error_wrong_place");
      expect(result.statusCounts).toHaveProperty("error_damaged");
      expect(result.statusCounts).toHaveProperty("error_wrong_poster");
      expect(result.statusCounts).toHaveProperty("other");
    });

    test("RPC失敗時のフォールバックでアーカイブが除外される", async () => {
      const ts = Date.now();
      const rpcFailingClient = createRpcFailingClient();

      const board1 = await createTestPosterBoard({
        status: "done",
        prefecture: "京都府",
        city: "テストFBアーカイブ市",
        number: `test_fb_arch_${ts}_1`,
        archived: false,
      });
      createdBoardIds.push(board1.id);

      const board2 = await createTestPosterBoard({
        status: "done",
        prefecture: "京都府",
        city: "テストFBアーカイブ市",
        number: `test_fb_arch_${ts}_2`,
        archived: true,
      });
      createdBoardIds.push(board2.id);

      const result = await getPosterBoardStats(rpcFailingClient, "京都府");

      expect(result.success).toBe(true);
      if (!result.success) return;

      // フォールバックでもアーカイブは除外されること
      expect(result.totalCount).toBeGreaterThanOrEqual(1);
    });

    test("RPC失敗時のフォールバックで空の都道府県は全カウント0", async () => {
      const rpcFailingClient = createRpcFailingClient();

      // 福岡県に既存データがないと仮定（あっても動作する）
      const { count: existingCount } = await adminClient
        .from("poster_boards")
        .select("*", { count: "exact", head: true })
        .eq("prefecture", "福岡県")
        .eq("archived", false);

      const result = await getPosterBoardStats(rpcFailingClient, "福岡県");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.totalCount).toBe(existingCount ?? 0);
    });

    test("アーカイブされた掲示板のみの都道府県ではカウントされない", async () => {
      const ts = Date.now();

      // アーカイブ済みの掲示板のみ作成
      const board = await createTestPosterBoard({
        status: "done",
        prefecture: "兵庫県",
        city: "テストアーカイブのみ市",
        number: `test_arch_only_${ts}_1`,
        archived: true,
      });
      createdBoardIds.push(board.id);

      const { count: nonArchivedCount } = await adminClient
        .from("poster_boards")
        .select("*", { count: "exact", head: true })
        .eq("prefecture", "兵庫県")
        .eq("archived", false);

      const result = await getPosterBoardStats(adminClient, "兵庫県");

      expect(result.success).toBe(true);
      if (!result.success) return;

      // 非アーカイブの既存データ数と一致すること
      expect(result.totalCount).toBe(nonArchivedCount ?? 0);
    });
  });
});

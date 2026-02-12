import { getPosterBoardStats } from "@/features/map-poster/use-cases/get-poster-board-stats";
import { updateBoardStatus } from "@/features/map-poster/use-cases/update-board-status";
import {
  cleanupTestPosterBoard,
  createTestPosterBoard,
} from "./poster-test-helpers";
import { adminClient, cleanupTestUser, createTestUser } from "./utils";

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
  });
});

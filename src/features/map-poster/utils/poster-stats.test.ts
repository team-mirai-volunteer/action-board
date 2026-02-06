import type { Database } from "@/lib/types/supabase";
import { countBoardsByStatus, createEmptyStatusCounts } from "./poster-stats";

type BoardStatus = Database["public"]["Enums"]["poster_board_status"];

describe("poster-stats", () => {
  describe("createEmptyStatusCounts", () => {
    it("全ステータスキーが0で初期化されたオブジェクトを返す", () => {
      const result = createEmptyStatusCounts();

      const expectedStatuses: BoardStatus[] = [
        "not_yet",
        "not_yet_dangerous",
        "reserved",
        "done",
        "error_wrong_place",
        "error_damaged",
        "error_wrong_poster",
        "other",
      ];

      for (const status of expectedStatuses) {
        expect(result[status]).toBe(0);
      }
      expect(Object.keys(result)).toHaveLength(expectedStatuses.length);
    });
  });

  describe("countBoardsByStatus", () => {
    it("複数ステータスが混在する場合、正しくカウントする", () => {
      const boards: { status: BoardStatus }[] = [
        { status: "done" },
        { status: "done" },
        { status: "not_yet" },
        { status: "reserved" },
        { status: "done" },
        { status: "error_damaged" },
        { status: "not_yet" },
      ];

      const result = countBoardsByStatus(boards);

      expect(result.done).toBe(3);
      expect(result.not_yet).toBe(2);
      expect(result.reserved).toBe(1);
      expect(result.error_damaged).toBe(1);
      expect(result.not_yet_dangerous).toBe(0);
      expect(result.error_wrong_place).toBe(0);
      expect(result.error_wrong_poster).toBe(0);
      expect(result.other).toBe(0);
    });

    it("全て同じステータスの場合、そのステータスのみカウントされる", () => {
      const boards: { status: BoardStatus }[] = [
        { status: "reserved" },
        { status: "reserved" },
        { status: "reserved" },
      ];

      const result = countBoardsByStatus(boards);

      expect(result.reserved).toBe(3);
      expect(result.done).toBe(0);
      expect(result.not_yet).toBe(0);
    });

    it("空配列の場合、全ステータスが0のオブジェクトを返す", () => {
      const boards: { status: BoardStatus }[] = [];

      const result = countBoardsByStatus(boards);

      const allZero = Object.values(result).every((count) => count === 0);
      expect(allZero).toBe(true);
      expect(Object.keys(result)).toHaveLength(8);
    });
  });
});

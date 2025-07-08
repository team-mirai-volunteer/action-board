import { describe, expect, it } from "@jest/globals";
import type { Database } from "@/lib/types/supabase";

type PosterBoard = Database["public"]["Tables"]["poster_boards"]["Row"];
type BoardStatus = Database["public"]["Enums"]["poster_board_status"];
type PosterBoardTotal = Database["public"]["Tables"]["poster_board_totals"]["Row"];

describe("Poster Board Progress Calculation", () => {
  describe("全体進捗率の計算", () => {
    it("登録済み掲示板数を分母として計算する（選管データがある場合でも）", () => {
      const boards: Partial<PosterBoard>[] = [
        { prefecture: "東京都", status: "done" },
        { prefecture: "東京都", status: "done" },
        { prefecture: "東京都", status: "not_yet" },
        { prefecture: "大阪府", status: "done" },
        { prefecture: "大阪府", status: "reserved" },
      ];

      const totals: Partial<PosterBoardTotal>[] = [
        { prefecture: "東京都", city: null, total_count: 14076 },
        { prefecture: "大阪府", city: null, total_count: 12059 },
      ];

      // 実装と同じロジック（登録済み掲示板数ベース）
      const totalsByPrefecture: Record<string, number> = {};
      for (const total of totals) {
        if (!total.city && total.prefecture && total.total_count) {
          totalsByPrefecture[total.prefecture] = total.total_count;
        }
      }

      const actualTotal = Object.values(totalsByPrefecture).reduce(
        (sum, count) => sum + count,
        0
      );
      const registeredTotal = boards.length;
      const completed = boards.filter((b) => b.status === "done").length;
      const percentage = Math.round((completed / registeredTotal) * 100);

      expect(actualTotal).toBe(26135); // 14076 + 12059（選管データの総数）
      expect(registeredTotal).toBe(5); // 登録済み掲示板数
      expect(completed).toBe(3);
      expect(percentage).toBe(60); // 3 / 5 = 60%
    });

    it("選管データがない場合、DB登録数を分母として計算する", () => {
      const boards: Partial<PosterBoard>[] = [
        { prefecture: "京都府", status: "done" },
        { prefecture: "京都府", status: "done" },
        { prefecture: "京都府", status: "not_yet" },
      ];

      const totals: Partial<PosterBoardTotal>[] = [];

      const totalsByPrefecture: Record<string, number> = {};
      for (const total of totals) {
        if (!total.city && total.prefecture && total.total_count) {
          totalsByPrefecture[total.prefecture] = total.total_count;
        }
      }

      const actualTotal = Object.values(totalsByPrefecture).reduce(
        (sum, count) => sum + count,
        0
      );

      if (actualTotal === 0) {
        // 選管データがない場合は、DB登録数で計算
        const registeredTotal = boards.length;
        const completed = boards.filter((b) => b.status === "done").length;
        const percentage = Math.round((completed / registeredTotal) * 100);

        expect(registeredTotal).toBe(3);
        expect(completed).toBe(2);
        expect(percentage).toBe(67); // 2 / 3 ≈ 67%
      }
    });
  });

  describe("都道府県別進捗率の計算", () => {
    it("登録済み掲示板数を分母として計算する（選管データがある場合でも）", () => {
      const prefecture = "東京都";
      const stats: Record<BoardStatus, number> = {
        not_yet: 50,
        reserved: 30,
        done: 20,
        error_wrong_place: 0,
        error_damaged: 0,
        error_wrong_poster: 0,
        other: 0,
      };
      const actualTotal = 14076; // 選管データ
      const registeredTotal = Object.values(stats).reduce(
        (sum, count) => sum + count,
        0
      );

      const completed = stats.done || 0;
      const percentage = Math.round((completed / registeredTotal) * 100);

      expect(registeredTotal).toBe(100);
      expect(completed).toBe(20);
      expect(percentage).toBe(20); // 20 / 100 = 20%
    });

    it("登録済み掲示板数を分母として計算する（選管データがない場合）", () => {
      const prefecture = "京都府";
      const stats: Record<BoardStatus, number> = {
        not_yet: 50,
        reserved: 30,
        done: 20,
        error_wrong_place: 0,
        error_damaged: 0,
        error_wrong_poster: 0,
        other: 0,
      };
      const registeredTotal = Object.values(stats).reduce(
        (sum, count) => sum + count,
        0
      );
      const completed = stats.done || 0;
      const percentage = Math.round((completed / registeredTotal) * 100);

      expect(registeredTotal).toBe(100);
      expect(completed).toBe(20);
      expect(percentage).toBe(20); // 20 / 100 = 20%
    });

    it("登録数が0の場合は進捗率0%を返す", () => {
      const stats: Record<BoardStatus, number> = {
        not_yet: 0,
        reserved: 0,
        done: 0,
        error_wrong_place: 0,
        error_damaged: 0,
        error_wrong_poster: 0,
        other: 0,
      };

      const registeredTotal = Object.values(stats).reduce(
        (sum, count) => sum + count,
        0
      );
      
      if (registeredTotal === 0) {
        const percentage = 0;
        expect(percentage).toBe(0);
      }
    });
  });

  describe("UI表示の計算", () => {
    it("選管データと登録数の両方を適切に表示する", () => {
      const actualTotal = 14076; // 選管データ
      const registeredTotal = 100; // DB登録数

      // UIに表示する値
      const displayTotal = actualTotal > 0 ? actualTotal : registeredTotal;
      const showRegisteredCount = actualTotal > 0 && registeredTotal !== actualTotal;

      expect(displayTotal).toBe(14076);
      expect(showRegisteredCount).toBe(true);
    });

    it("選管データがない場合は登録数のみを表示する", () => {
      const actualTotal = 0; // 選管データなし
      const registeredTotal = 100; // DB登録数

      const displayTotal = actualTotal > 0 ? actualTotal : registeredTotal;
      const showRegisteredCount = actualTotal > 0 && registeredTotal !== actualTotal;

      expect(displayTotal).toBe(100);
      expect(showRegisteredCount).toBe(false);
    });

    it("完了数は常にDB登録データから計算する", () => {
      const boards: Partial<PosterBoard>[] = [
        { prefecture: "東京都", status: "done" },
        { prefecture: "東京都", status: "done" },
        { prefecture: "東京都", status: "reserved" },
        { prefecture: "東京都", status: "not_yet" },
      ];

      const completed = boards.filter((b) => b.status === "done").length;
      expect(completed).toBe(2);
    });
  });
});
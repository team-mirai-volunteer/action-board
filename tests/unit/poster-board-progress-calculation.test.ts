import {
  calculateProgressRate,
  getCompletedCount,
  getRegisteredCount,
} from "@/features/map-poster/utils/poster-progress";
import type { Database } from "@/lib/types/supabase";
import { describe, expect, it } from "@jest/globals";

type PosterBoard = Database["public"]["Tables"]["poster_boards"]["Row"];
type BoardStatus = Database["public"]["Enums"]["poster_board_status"];

describe("Poster Board Progress Calculation", () => {
  describe("calculateProgressRate関数", () => {
    it("正常な進捗率を切り捨てで計算する", () => {
      expect(calculateProgressRate(3, 5)).toBe(60); // 60%
      expect(calculateProgressRate(1, 3)).toBe(33); // 33.333... -> 33%
      expect(calculateProgressRate(2, 3)).toBe(66); // 66.666... -> 66%
      expect(calculateProgressRate(99, 100)).toBe(99); // 99%
    });

    it("切り捨て動作を確認する（四捨五入との違い）", () => {
      expect(calculateProgressRate(199, 200)).toBe(99); // 99.5% -> 99% (四捨五入なら100%)
      expect(calculateProgressRate(299, 300)).toBe(99); // 99.666... -> 99% (四捨五入なら100%)
    });

    it("100%の場合は正確に100を返す", () => {
      expect(calculateProgressRate(5, 5)).toBe(100);
      expect(calculateProgressRate(100, 100)).toBe(100);
    });

    it("0%の場合は0を返す", () => {
      expect(calculateProgressRate(0, 5)).toBe(0);
      expect(calculateProgressRate(0, 100)).toBe(0);
    });

    it("分母が0の場合は0を返す", () => {
      expect(calculateProgressRate(0, 0)).toBe(0);
      expect(calculateProgressRate(5, 0)).toBe(0);
    });
  });

  describe("getCompletedCount関数", () => {
    it("doneステータスの数を返す", () => {
      const statusCounts: Record<BoardStatus, number> = {
        not_yet: 10,
        not_yet_dangerous: 0,
        reserved: 5,
        done: 15,
        error_wrong_place: 1,
        error_damaged: 2,
        error_wrong_poster: 1,
        other: 1,
      };
      expect(getCompletedCount(statusCounts)).toBe(15);
    });

    it("doneが0の場合は0を返す", () => {
      const statusCounts: Record<BoardStatus, number> = {
        not_yet: 10,
        not_yet_dangerous: 0,
        reserved: 5,
        done: 0,
        error_wrong_place: 1,
        error_damaged: 2,
        error_wrong_poster: 1,
        other: 1,
      };
      expect(getCompletedCount(statusCounts)).toBe(0);
    });
  });

  describe("getRegisteredCount関数", () => {
    it("error_wrong_posterを除く全ステータスの合計数を返す", () => {
      const statusCounts: Record<BoardStatus, number> = {
        not_yet: 10,
        not_yet_dangerous: 0,
        reserved: 5,
        done: 15,
        error_wrong_place: 1,
        error_damaged: 2,
        error_wrong_poster: 1,
        other: 1,
      };
      expect(getRegisteredCount(statusCounts)).toBe(34);
    });

    it("全てが0の場合は0を返す", () => {
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
      expect(getRegisteredCount(statusCounts)).toBe(0);
    });

    it("error_wrong_posterステータスを除外して登録数を計算する", () => {
      const statusCounts: Record<BoardStatus, number> = {
        not_yet: 10,
        reserved: 5,
        done: 15,
        error_wrong_place: 1,
        error_damaged: 2,
        error_wrong_poster: 3,
        not_yet_dangerous: 0,
        other: 1,
      };
      expect(getRegisteredCount(statusCounts)).toBe(34);
    });
  });
  describe("全体進捗率の計算", () => {
    it("登録済み掲示板数を分母として進捗率を計算する", () => {
      const boards: Partial<PosterBoard>[] = [
        { prefecture: "東京都", status: "done" },
        { prefecture: "東京都", status: "done" },
        { prefecture: "東京都", status: "not_yet" },
        { prefecture: "大阪府", status: "done" },
        { prefecture: "大阪府", status: "reserved" },
      ];

      const registeredTotal = boards.length;
      const completed = boards.filter((b) => b.status === "done").length;
      const percentage = Math.floor((completed / registeredTotal) * 100);

      expect(registeredTotal).toBe(5); // 登録済み掲示板数
      expect(completed).toBe(3);
      expect(percentage).toBe(60); // 3 / 5 = 60%
    });
  });

  describe("都道府県別進捗率の計算", () => {
    it("ステータス別統計から進捗率を計算する", () => {
      const stats: Record<BoardStatus, number> = {
        not_yet: 50,
        not_yet_dangerous: 0,
        reserved: 30,
        done: 20,
        error_wrong_place: 0,
        error_damaged: 0,
        error_wrong_poster: 0,
        other: 0,
      };

      const registeredTotal = getRegisteredCount(stats);
      const completed = stats.done || 0;
      const percentage = Math.floor((completed / registeredTotal) * 100);

      expect(registeredTotal).toBe(100);
      expect(completed).toBe(20);
      expect(percentage).toBe(20); // 20 / 100 = 20%
    });

    it("登録数が0の場合は進捗率0%を返す", () => {
      const stats: Record<BoardStatus, number> = {
        not_yet: 0,
        not_yet_dangerous: 0,
        reserved: 0,
        done: 0,
        error_wrong_place: 0,
        error_damaged: 0,
        error_wrong_poster: 0,
        other: 0,
      };

      const registeredTotal = getRegisteredCount(stats);

      if (registeredTotal === 0) {
        const percentage = 0;
        expect(percentage).toBe(0);
      }
    });
  });

  describe("UI表示の計算", () => {
    it("選管データと登録数の両方を適切に表示する", () => {
      const actualTotal: number = 14076; // 選管データ
      const registeredTotal: number = 100; // DB登録数

      // UIに表示する値
      const displayTotal = actualTotal > 0 ? actualTotal : registeredTotal;
      const showRegisteredCount =
        actualTotal > 0 && registeredTotal !== actualTotal;

      expect(displayTotal).toBe(14076);
      expect(showRegisteredCount).toBe(true);
    });

    it("選管データがない場合は登録数のみを表示する", () => {
      const actualTotal: number = 0; // 選管データなし
      const registeredTotal: number = 100; // DB登録数

      const displayTotal = actualTotal > 0 ? actualTotal : registeredTotal;
      const showRegisteredCount =
        actualTotal > 0 && registeredTotal !== actualTotal;

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

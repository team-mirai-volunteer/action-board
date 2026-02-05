import type { BoardStatus } from "../types/poster-types";
import {
  calculateProgressRate,
  getCompletedCount,
  getRegisteredCount,
} from "./poster-progress";

// テスト用のステータス別カウントを作成するヘルパー
function createStatusCounts(
  overrides: Partial<Record<BoardStatus, number>> = {},
): Record<BoardStatus, number> {
  return {
    not_yet: 0,
    reserved: 0,
    done: 0,
    error_wrong_place: 0,
    error_damaged: 0,
    error_wrong_poster: 0,
    other: 0,
    not_yet_dangerous: 0,
    ...overrides,
  };
}

describe("calculateProgressRate", () => {
  it("正常な進捗率を計算する", () => {
    expect(calculateProgressRate(50, 100)).toBe(50);
  });

  it("完了数0の場合は0を返す", () => {
    expect(calculateProgressRate(0, 100)).toBe(0);
  });

  it("全て完了の場合は100を返す", () => {
    expect(calculateProgressRate(100, 100)).toBe(100);
  });

  it("登録数0の場合は0を返す（ゼロ除算回避）", () => {
    expect(calculateProgressRate(0, 0)).toBe(0);
  });

  it("小数点以下を切り捨てる", () => {
    expect(calculateProgressRate(1, 3)).toBe(33); // 33.33... → 33
    expect(calculateProgressRate(2, 3)).toBe(66); // 66.66... → 66
  });
});

describe("getCompletedCount", () => {
  it("doneステータスの数を返す", () => {
    const counts = createStatusCounts({ done: 42 });
    expect(getCompletedCount(counts)).toBe(42);
  });

  it("doneが0の場合は0を返す", () => {
    const counts = createStatusCounts({ not_yet: 10, reserved: 5 });
    expect(getCompletedCount(counts)).toBe(0);
  });
});

describe("getRegisteredCount", () => {
  it("全ステータスの合計を返す（error_wrong_poster除く）", () => {
    const counts = createStatusCounts({
      not_yet: 10,
      reserved: 5,
      done: 20,
    });
    expect(getRegisteredCount(counts)).toBe(35);
  });

  it("error_wrong_posterは分母から除外される", () => {
    const counts = createStatusCounts({
      not_yet: 10,
      done: 20,
      error_wrong_poster: 5,
    });
    // 10 + 20 = 30（error_wrong_posterの5は含まない）
    expect(getRegisteredCount(counts)).toBe(30);
  });

  it("全て0の場合は0を返す", () => {
    const counts = createStatusCounts();
    expect(getRegisteredCount(counts)).toBe(0);
  });

  it("error_wrong_posterだけの場合は0を返す", () => {
    const counts = createStatusCounts({ error_wrong_poster: 10 });
    expect(getRegisteredCount(counts)).toBe(0);
  });

  it("全ステータスが混在するケース", () => {
    const counts = createStatusCounts({
      not_yet: 100,
      reserved: 20,
      done: 50,
      error_wrong_place: 3,
      error_damaged: 2,
      error_wrong_poster: 15,
      other: 1,
      not_yet_dangerous: 5,
    });
    // 100 + 20 + 50 + 3 + 2 + 1 + 5 = 181（error_wrong_posterの15は除外）
    expect(getRegisteredCount(counts)).toBe(181);
  });
});

import type { BatchXpTransaction, UserLevel } from "../types/level-types";
import { aggregateXpByUser, buildLevelUpdates } from "./xp-batch-helpers";

describe("aggregateXpByUser", () => {
  it("空配列の場合は空のMapを返す", () => {
    const result = aggregateXpByUser([]);
    expect(result.size).toBe(0);
  });

  it("単一ユーザーの単一トランザクションを集計する", () => {
    const transactions: BatchXpTransaction[] = [
      { userId: "user1", xpAmount: 100, sourceType: "MISSION_COMPLETION" },
    ];
    const result = aggregateXpByUser(transactions);
    expect(result.get("user1")).toBe(100);
  });

  it("単一ユーザーの複数トランザクションを合算する", () => {
    const transactions: BatchXpTransaction[] = [
      { userId: "user1", xpAmount: 100, sourceType: "MISSION_COMPLETION" },
      { userId: "user1", xpAmount: 200, sourceType: "BONUS" },
      { userId: "user1", xpAmount: 50, sourceType: "MISSION_COMPLETION" },
    ];
    const result = aggregateXpByUser(transactions);
    expect(result.get("user1")).toBe(350);
  });

  it("複数ユーザーのトランザクションを個別に集計する", () => {
    const transactions: BatchXpTransaction[] = [
      { userId: "user1", xpAmount: 100, sourceType: "MISSION_COMPLETION" },
      { userId: "user2", xpAmount: 200, sourceType: "BONUS" },
      { userId: "user1", xpAmount: 50, sourceType: "MISSION_COMPLETION" },
      { userId: "user3", xpAmount: 300, sourceType: "MISSION_COMPLETION" },
      { userId: "user2", xpAmount: 150, sourceType: "MISSION_COMPLETION" },
    ];
    const result = aggregateXpByUser(transactions);
    expect(result.get("user1")).toBe(150);
    expect(result.get("user2")).toBe(350);
    expect(result.get("user3")).toBe(300);
    expect(result.size).toBe(3);
  });

  it("負のXP量も正しく集計する", () => {
    const transactions: BatchXpTransaction[] = [
      { userId: "user1", xpAmount: 100, sourceType: "MISSION_COMPLETION" },
      { userId: "user1", xpAmount: -50, sourceType: "PENALTY" },
    ];
    const result = aggregateXpByUser(transactions);
    expect(result.get("user1")).toBe(50);
  });
});

describe("buildLevelUpdates", () => {
  const seasonId = "season-1";

  function makeUserLevel(userId: string, xp: number, level: number): UserLevel {
    return {
      user_id: userId,
      season_id: seasonId,
      xp,
      level,
      last_notified_level: null,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    } as UserLevel;
  }

  it("空のXP変動マップの場合は空の結果を返す", () => {
    const userXpChanges = new Map<string, number>();
    const levelMap = new Map<string, UserLevel>();
    const { levelUpdates, results } = buildLevelUpdates(
      userXpChanges,
      levelMap,
      seasonId,
    );
    expect(levelUpdates).toHaveLength(0);
    expect(results).toHaveLength(0);
  });

  it("レベル情報がないユーザーにはエラー結果を返す", () => {
    const userXpChanges = new Map([["user1", 100]]);
    const levelMap = new Map<string, UserLevel>();
    const { levelUpdates, results } = buildLevelUpdates(
      userXpChanges,
      levelMap,
      seasonId,
    );
    expect(levelUpdates).toHaveLength(0);
    expect(results).toHaveLength(1);
    expect(results[0].userId).toBe("user1");
    expect(results[0].success).toBe(false);
    expect(results[0].error).toBe("ユーザーレベル情報が見つかりません");
  });

  it("XP追加後の新しいレベルを正しく計算する", () => {
    const userXpChanges = new Map([["user1", 100]]);
    const levelMap = new Map([["user1", makeUserLevel("user1", 0, 1)]]);
    const { levelUpdates, results } = buildLevelUpdates(
      userXpChanges,
      levelMap,
      seasonId,
    );
    expect(levelUpdates).toHaveLength(1);
    expect(levelUpdates[0].user_id).toBe("user1");
    expect(levelUpdates[0].season_id).toBe(seasonId);
    expect(levelUpdates[0].xp).toBe(100);
    // XP 100 -> level 3 (totalXp(3) = 95, totalXp(4) = 165)
    expect(levelUpdates[0].level).toBe(3);
    expect(results).toHaveLength(1);
    expect(results[0].userId).toBe("user1");
    expect(results[0].success).toBe(true);
    expect(results[0].newXp).toBe(100);
    expect(results[0].newLevel).toBe(3);
  });

  it("複数ユーザーのレベル更新を正しく構築する", () => {
    const userXpChanges = new Map([
      ["user1", 50],
      ["user2", 200],
    ]);
    const levelMap = new Map([
      ["user1", makeUserLevel("user1", 0, 1)],
      ["user2", makeUserLevel("user2", 100, 3)],
    ]);
    const { levelUpdates, results } = buildLevelUpdates(
      userXpChanges,
      levelMap,
      seasonId,
    );
    expect(levelUpdates).toHaveLength(2);
    expect(results).toHaveLength(2);

    // user1: 0 + 50 = 50 XP -> level 2
    const user1Update = levelUpdates.find((u) => u.user_id === "user1");
    expect(user1Update?.xp).toBe(50);
    expect(user1Update?.level).toBe(2);

    // user2: 100 + 200 = 300 XP -> level 5 (totalXp(5) = 250, totalXp(6) = 350)
    const user2Update = levelUpdates.find((u) => u.user_id === "user2");
    expect(user2Update?.xp).toBe(300);
    expect(user2Update?.level).toBe(5);
  });

  it("レベル情報があるユーザーとないユーザーが混在する場合", () => {
    const userXpChanges = new Map([
      ["user1", 50],
      ["user2", 100],
    ]);
    const levelMap = new Map([["user1", makeUserLevel("user1", 0, 1)]]);
    const { levelUpdates, results } = buildLevelUpdates(
      userXpChanges,
      levelMap,
      seasonId,
    );
    expect(levelUpdates).toHaveLength(1);
    expect(results).toHaveLength(2);

    const successResult = results.find((r) => r.userId === "user1");
    expect(successResult?.success).toBe(true);
    expect(successResult?.newXp).toBe(50);

    const failResult = results.find((r) => r.userId === "user2");
    expect(failResult?.success).toBe(false);
    expect(failResult?.error).toBe("ユーザーレベル情報が見つかりません");
  });

  it("updated_atにISO文字列が設定される", () => {
    const userXpChanges = new Map([["user1", 50]]);
    const levelMap = new Map([["user1", makeUserLevel("user1", 0, 1)]]);
    const { levelUpdates } = buildLevelUpdates(
      userXpChanges,
      levelMap,
      seasonId,
    );
    expect(levelUpdates[0].updated_at).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    );
  });

  it("既存XPに加算される", () => {
    const userXpChanges = new Map([["user1", 50]]);
    const levelMap = new Map([["user1", makeUserLevel("user1", 200, 4)]]);
    const { levelUpdates, results } = buildLevelUpdates(
      userXpChanges,
      levelMap,
      seasonId,
    );
    // 200 + 50 = 250 XP -> level 5
    expect(levelUpdates[0].xp).toBe(250);
    expect(levelUpdates[0].level).toBe(5);
    expect(results[0].newXp).toBe(250);
    expect(results[0].newLevel).toBe(5);
  });
});

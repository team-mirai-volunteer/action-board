import { totalXp } from "./level-calculator";
import {
  buildLevelUpNotificationData,
  shouldShowLevelUpNotification,
} from "./level-up-helpers";

describe("shouldShowLevelUpNotification", () => {
  it("レベルが上がっている場合はtrueを返す", () => {
    expect(shouldShowLevelUpNotification(3, 2)).toBe(true);
  });

  it("レベルが同じ場合はfalseを返す", () => {
    expect(shouldShowLevelUpNotification(2, 2)).toBe(false);
  });

  it("レベルが下がっている場合はfalseを返す", () => {
    expect(shouldShowLevelUpNotification(1, 2)).toBe(false);
  });

  it("lastNotifiedLevelがnullの場合は1として扱う", () => {
    expect(shouldShowLevelUpNotification(2, null)).toBe(true);
    expect(shouldShowLevelUpNotification(1, null)).toBe(false);
  });

  it("大きなレベル差でもtrueを返す", () => {
    expect(shouldShowLevelUpNotification(10, 1)).toBe(true);
  });
});

describe("buildLevelUpNotificationData", () => {
  it("レベルアップ通知データを正しく構築する", () => {
    const result = buildLevelUpNotificationData(3, 2, 100);

    expect(result.shouldNotify).toBe(true);
    expect(result.levelUp).toBeDefined();
    expect(result.levelUp?.previousLevel).toBe(2);
    expect(result.levelUp?.newLevel).toBe(3);
  });

  it("pointsToNextLevelが正しく計算される", () => {
    const currentLevel = 3;
    const xp = 100;
    const expectedNextLevelXp = totalXp(currentLevel + 1);
    const expectedPointsToNext = Math.max(0, expectedNextLevelXp - xp);

    const result = buildLevelUpNotificationData(currentLevel, 2, xp);

    expect(result.levelUp?.pointsToNextLevel).toBe(expectedPointsToNext);
  });

  it("XPが次のレベルを超えている場合はpointsToNextLevelが0になる", () => {
    const currentLevel = 2;
    const xp = 999999;

    const result = buildLevelUpNotificationData(currentLevel, 1, xp);

    expect(result.levelUp?.pointsToNextLevel).toBe(0);
  });

  it("lastNotifiedLevelがnullの場合はpreviousLevelが1になる", () => {
    const result = buildLevelUpNotificationData(5, null, 500);

    expect(result.levelUp?.previousLevel).toBe(1);
    expect(result.levelUp?.newLevel).toBe(5);
  });

  it("レベル1から2への遷移で正しいデータを返す", () => {
    const xp = 50;
    const result = buildLevelUpNotificationData(2, 1, xp);

    expect(result.shouldNotify).toBe(true);
    expect(result.levelUp?.previousLevel).toBe(1);
    expect(result.levelUp?.newLevel).toBe(2);
    const expectedPoints = Math.max(0, totalXp(3) - xp);
    expect(result.levelUp?.pointsToNextLevel).toBe(expectedPoints);
  });
});

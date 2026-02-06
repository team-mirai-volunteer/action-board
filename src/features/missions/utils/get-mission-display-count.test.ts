import { getMissionDisplayCount } from "./get-mission-display-count";

describe("getMissionDisplayCount", () => {
  const missionId = "mission-1";

  describe("postingCountMapから値を取得する", () => {
    test("postingCountMapにミッションIDがある場合、その値を返す", () => {
      const achievementCountMap = new Map<string, number>();
      const postingCountMap = new Map<string, number>([[missionId, 150]]);

      expect(
        getMissionDisplayCount(missionId, achievementCountMap, postingCountMap),
      ).toBe(150);
    });

    test("両方のMapに値がある場合、postingCountMapを優先する", () => {
      const achievementCountMap = new Map<string, number>([[missionId, 10]]);
      const postingCountMap = new Map<string, number>([[missionId, 200]]);

      expect(
        getMissionDisplayCount(missionId, achievementCountMap, postingCountMap),
      ).toBe(200);
    });

    test("postingCountMapの値が0の場合、0を返す（??演算子なので0はそのまま返る）", () => {
      const achievementCountMap = new Map<string, number>([[missionId, 10]]);
      const postingCountMap = new Map<string, number>([[missionId, 0]]);

      expect(
        getMissionDisplayCount(missionId, achievementCountMap, postingCountMap),
      ).toBe(0);
    });
  });

  describe("achievementCountMapから値を取得する", () => {
    test("postingCountMapにミッションIDがなくachievementCountMapにある場合、achievementの値を返す", () => {
      const achievementCountMap = new Map<string, number>([[missionId, 42]]);
      const postingCountMap = new Map<string, number>();

      expect(
        getMissionDisplayCount(missionId, achievementCountMap, postingCountMap),
      ).toBe(42);
    });

    test("postingCountMapがundefinedの場合、achievementCountMapから取得する", () => {
      const achievementCountMap = new Map<string, number>([[missionId, 25]]);

      expect(
        getMissionDisplayCount(missionId, achievementCountMap, undefined),
      ).toBe(25);
    });

    test("postingCountMapが省略された場合、achievementCountMapから取得する", () => {
      const achievementCountMap = new Map<string, number>([[missionId, 30]]);

      expect(getMissionDisplayCount(missionId, achievementCountMap)).toBe(30);
    });
  });

  describe("どちらのMapにもない場合", () => {
    test("両方のMapにミッションIDがない場合、0を返す", () => {
      const achievementCountMap = new Map<string, number>();
      const postingCountMap = new Map<string, number>();

      expect(
        getMissionDisplayCount(missionId, achievementCountMap, postingCountMap),
      ).toBe(0);
    });

    test("postingCountMapがundefinedでachievementCountMapにもない場合、0を返す", () => {
      const achievementCountMap = new Map<string, number>();

      expect(getMissionDisplayCount(missionId, achievementCountMap)).toBe(0);
    });

    test("別のミッションIDのみ存在する場合、0を返す", () => {
      const achievementCountMap = new Map<string, number>([
        ["other-mission", 10],
      ]);
      const postingCountMap = new Map<string, number>([["other-mission", 100]]);

      expect(
        getMissionDisplayCount(missionId, achievementCountMap, postingCountMap),
      ).toBe(0);
    });
  });
});

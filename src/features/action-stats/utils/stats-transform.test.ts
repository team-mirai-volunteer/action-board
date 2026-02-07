import {
  mapMissionRankingResults,
  type RawMissionRankingItem,
  transformActionStatsResult,
} from "./stats-transform";

describe("transformActionStatsResult", () => {
  it("should transform a valid result", () => {
    const result = transformActionStatsResult({
      total_actions: 100,
      active_users: 50,
      daily_actions_increase: 10,
      daily_users_increase: 5,
    });

    expect(result).toEqual({
      totalActions: 100,
      activeUsers: 50,
      dailyActionsIncrease: 10,
      dailyUsersIncrease: 5,
    });
  });

  it("should handle null/undefined result", () => {
    expect(transformActionStatsResult(null)).toEqual({
      totalActions: 0,
      activeUsers: 0,
      dailyActionsIncrease: 0,
      dailyUsersIncrease: 0,
    });

    expect(transformActionStatsResult(undefined)).toEqual({
      totalActions: 0,
      activeUsers: 0,
      dailyActionsIncrease: 0,
      dailyUsersIncrease: 0,
    });
  });

  it("should handle null fields in result", () => {
    const result = transformActionStatsResult({
      total_actions: null,
      active_users: null,
      daily_actions_increase: null,
      daily_users_increase: null,
    });

    expect(result).toEqual({
      totalActions: 0,
      activeUsers: 0,
      dailyActionsIncrease: 0,
      dailyUsersIncrease: 0,
    });
  });

  it("should handle string number values from RPC", () => {
    const result = transformActionStatsResult({
      total_actions: "150",
      active_users: "30",
      daily_actions_increase: "12",
      daily_users_increase: "3",
    });

    expect(result).toEqual({
      totalActions: 150,
      activeUsers: 30,
      dailyActionsIncrease: 12,
      dailyUsersIncrease: 3,
    });
  });

  it("should handle partial result with missing fields", () => {
    const result = transformActionStatsResult({
      total_actions: 50,
    });

    expect(result).toEqual({
      totalActions: 50,
      activeUsers: 0,
      dailyActionsIncrease: 0,
      dailyUsersIncrease: 0,
    });
  });
});

describe("mapMissionRankingResults", () => {
  it("should map raw ranking items to MissionActionRanking", () => {
    const data: RawMissionRankingItem[] = [
      {
        mission_id: "m1",
        mission_title: "Mission 1",
        mission_slug: "mission-1",
        icon_url: "https://example.com/icon.png",
        action_count: 100,
        is_hidden: false,
      },
      {
        mission_id: "m2",
        mission_title: "Mission 2",
        mission_slug: "mission-2",
        icon_url: null,
        action_count: 50,
        is_hidden: true,
      },
    ];

    const result = mapMissionRankingResults(data);

    expect(result).toEqual([
      {
        missionId: "m1",
        missionTitle: "Mission 1",
        missionSlug: "mission-1",
        iconUrl: "https://example.com/icon.png",
        actionCount: 100,
        isHidden: false,
      },
      {
        missionId: "m2",
        missionTitle: "Mission 2",
        missionSlug: "mission-2",
        iconUrl: null,
        actionCount: 50,
        isHidden: true,
      },
    ]);
  });

  it("should return empty array for empty input", () => {
    expect(mapMissionRankingResults([])).toEqual([]);
  });

  it("should convert action_count to number", () => {
    const data: RawMissionRankingItem[] = [
      {
        mission_id: "m1",
        mission_title: "Mission 1",
        mission_slug: "mission-1",
        icon_url: null,
        action_count: 42,
        is_hidden: false,
      },
    ];

    const result = mapMissionRankingResults(data);
    expect(result[0].actionCount).toBe(42);
    expect(typeof result[0].actionCount).toBe("number");
  });
});

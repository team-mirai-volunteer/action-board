import {
  aggregateAchievementCounts,
  buildAchievementMap,
  type RawAchievementRecord,
} from "./achievement-aggregation";

describe("aggregateAchievementCounts", () => {
  it("should aggregate achievements by mission", () => {
    const data: RawAchievementRecord[] = [
      {
        mission_id: "m1",
        missions: {
          id: "m1",
          slug: "mission-1",
          title: "Mission 1",
          max_achievement_count: null,
        },
      },
      {
        mission_id: "m1",
        missions: {
          id: "m1",
          slug: "mission-1",
          title: "Mission 1",
          max_achievement_count: null,
        },
      },
      {
        mission_id: "m2",
        missions: {
          id: "m2",
          slug: "mission-2",
          title: "Mission 2",
          max_achievement_count: null,
        },
      },
    ];

    const result = aggregateAchievementCounts(data);

    expect(result).toHaveLength(2);
    const m1 = result.find((r) => r.mission_id === "m1");
    const m2 = result.find((r) => r.mission_id === "m2");
    expect(m1?.achievement_count).toBe(2);
    expect(m1?.mission_slug).toBe("mission-1");
    expect(m1?.mission_title).toBe("Mission 1");
    expect(m2?.achievement_count).toBe(1);
  });

  it("should skip records with null mission_id", () => {
    const data: RawAchievementRecord[] = [
      {
        mission_id: null,
        missions: {
          id: "m1",
          slug: "mission-1",
          title: "Mission 1",
          max_achievement_count: null,
        },
      },
      {
        mission_id: "m1",
        missions: {
          id: "m1",
          slug: "mission-1",
          title: "Mission 1",
          max_achievement_count: null,
        },
      },
    ];

    const result = aggregateAchievementCounts(data);
    expect(result).toHaveLength(1);
    expect(result[0].achievement_count).toBe(1);
  });

  it("should skip records with null missions relation", () => {
    const data: RawAchievementRecord[] = [
      {
        mission_id: "m1",
        missions: null,
      },
    ];

    const result = aggregateAchievementCounts(data);
    expect(result).toHaveLength(0);
  });

  it("should return empty array for empty input", () => {
    expect(aggregateAchievementCounts([])).toEqual([]);
  });

  it("should only return achievements with count > 0", () => {
    const data: RawAchievementRecord[] = [
      {
        mission_id: "m1",
        missions: {
          id: "m1",
          slug: "mission-1",
          title: "Mission 1",
          max_achievement_count: null,
        },
      },
    ];

    const result = aggregateAchievementCounts(data);
    expect(result).toHaveLength(1);
    expect(result[0].achievement_count).toBeGreaterThan(0);
  });
});

describe("buildAchievementMap", () => {
  it("should build a map of mission_id to count", () => {
    const achievements = [
      { mission_id: "m1" },
      { mission_id: "m1" },
      { mission_id: "m2" },
      { mission_id: "m1" },
    ];

    const result = buildAchievementMap(achievements);

    expect(result.get("m1")).toBe(3);
    expect(result.get("m2")).toBe(1);
    expect(result.size).toBe(2);
  });

  it("should skip null mission_ids", () => {
    const achievements = [
      { mission_id: "m1" },
      { mission_id: null },
      { mission_id: "m1" },
    ];

    const result = buildAchievementMap(achievements);
    expect(result.get("m1")).toBe(2);
    expect(result.size).toBe(1);
  });

  it("should return empty map for empty input", () => {
    const result = buildAchievementMap([]);
    expect(result.size).toBe(0);
  });

  it("should handle single achievement", () => {
    const result = buildAchievementMap([{ mission_id: "m1" }]);
    expect(result.get("m1")).toBe(1);
    expect(result.size).toBe(1);
  });
});

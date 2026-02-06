import {
  mapAchievementsToTimeline,
  mapActivitiesToTimeline,
  mergeAndSortTimeline,
} from "./timeline-transforms";

const mockProfile = {
  name: "Test User",
  address_prefecture: "Tokyo",
  avatar_url: "https://example.com/avatar.png",
};

const mockPartyMembership = {
  user_id: "user-1",
  plan: "supporter",
  badge_visibility: true,
  metadata: null,
  synced_at: "2025-01-01T00:00:00Z",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
} as const;

describe("mapAchievementsToTimeline", () => {
  it("returns empty array for empty input", () => {
    const result = mapAchievementsToTimeline([], "user-1", mockProfile, null);
    expect(result).toEqual([]);
  });

  it("maps a single achievement to timeline item", () => {
    const achievements = [
      {
        id: "ach-1",
        created_at: "2025-06-01T10:00:00Z",
        user_id: "user-1",
        mission_id: "mission-1",
        missions: { title: "First Mission", slug: "first-mission" },
      },
    ];

    const result = mapAchievementsToTimeline(
      achievements,
      "user-1",
      mockProfile,
      mockPartyMembership,
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "achievement_ach-1",
      user_id: "user-1",
      name: "Test User",
      address_prefecture: "Tokyo",
      avatar_url: "https://example.com/avatar.png",
      title: "First Mission",
      mission_id: "mission-1",
      mission_slug: "first-mission",
      created_at: "2025-06-01T10:00:00Z",
      activity_type: "mission_achievement",
      party_membership: mockPartyMembership,
    });
  });

  it("uses empty defaults when userProfile is null", () => {
    const achievements = [
      {
        id: "ach-2",
        created_at: "2025-06-01T10:00:00Z",
        user_id: "user-1",
        mission_id: "mission-1",
        missions: { title: "Mission", slug: "mission" },
      },
    ];

    const result = mapAchievementsToTimeline(
      achievements,
      "user-1",
      null,
      null,
    );

    expect(result[0].name).toBe("");
    expect(result[0].address_prefecture).toBeNull();
    expect(result[0].avatar_url).toBeNull();
    expect(result[0].party_membership).toBeNull();
  });
});

describe("mapActivitiesToTimeline", () => {
  it("returns empty array for empty input", () => {
    const result = mapActivitiesToTimeline([], "user-1", mockProfile, null);
    expect(result).toEqual([]);
  });

  it("maps a single activity to timeline item", () => {
    const activities = [
      {
        id: "act-1",
        created_at: "2025-06-02T12:00:00Z",
        activity_title: "Signed up",
        activity_type: "signup",
        user_id: "user-1",
      },
    ];

    const result = mapActivitiesToTimeline(
      activities,
      "user-1",
      mockProfile,
      null,
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "activity_act-1",
      user_id: "user-1",
      name: "Test User",
      address_prefecture: "Tokyo",
      avatar_url: "https://example.com/avatar.png",
      title: "Signed up",
      mission_id: null,
      mission_slug: null,
      created_at: "2025-06-02T12:00:00Z",
      activity_type: "signup",
      party_membership: null,
    });
  });

  it("uses empty defaults when userProfile is null", () => {
    const activities = [
      {
        id: "act-2",
        created_at: "2025-06-02T12:00:00Z",
        activity_title: "Activity",
        activity_type: "level_up",
        user_id: "user-1",
      },
    ];

    const result = mapActivitiesToTimeline(activities, "user-1", null, null);

    expect(result[0].name).toBe("");
    expect(result[0].address_prefecture).toBeNull();
    expect(result[0].avatar_url).toBeNull();
  });
});

describe("mergeAndSortTimeline", () => {
  const item1 = {
    id: "1",
    user_id: "user-1",
    name: "User",
    address_prefecture: null,
    avatar_url: null,
    title: "Oldest",
    mission_id: null,
    mission_slug: null,
    created_at: "2025-06-01T00:00:00Z",
    activity_type: "signup",
  };

  const item2 = {
    id: "2",
    user_id: "user-1",
    name: "User",
    address_prefecture: null,
    avatar_url: null,
    title: "Middle",
    mission_id: null,
    mission_slug: null,
    created_at: "2025-06-02T00:00:00Z",
    activity_type: "mission_achievement",
  };

  const item3 = {
    id: "3",
    user_id: "user-1",
    name: "User",
    address_prefecture: null,
    avatar_url: null,
    title: "Newest",
    mission_id: null,
    mission_slug: null,
    created_at: "2025-06-03T00:00:00Z",
    activity_type: "level_up",
  };

  it("returns empty array when all inputs are empty", () => {
    const result = mergeAndSortTimeline([], [], 10);
    expect(result).toEqual([]);
  });

  it("merges and sorts a single array", () => {
    const result = mergeAndSortTimeline([item1, item3, item2], 10);
    expect(result.map((i) => i.title)).toEqual(["Newest", "Middle", "Oldest"]);
  });

  it("merges multiple arrays and sorts by date descending", () => {
    const result = mergeAndSortTimeline([item1], [item3], [item2], 10);
    expect(result.map((i) => i.title)).toEqual(["Newest", "Middle", "Oldest"]);
  });

  it("applies limit correctly", () => {
    const result = mergeAndSortTimeline([item1, item2, item3], 2);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Newest");
    expect(result[1].title).toBe("Middle");
  });

  it("returns all items when limit exceeds array length", () => {
    const result = mergeAndSortTimeline([item1, item2], 100);
    expect(result).toHaveLength(2);
  });

  it("returns empty array when limit is 0", () => {
    const result = mergeAndSortTimeline([item1, item2], 0);
    expect(result).toEqual([]);
  });
});

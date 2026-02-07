import {
  enrichTimelineItemsWithMemberships,
  extractValidUserIds,
  mapAchievementsToTimeline,
  mapAchievementToTimeline,
  mapActivitiesToTimeline,
  mapActivityToTimeline,
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

describe("mapAchievementToTimeline", () => {
  it("maps a single achievement to timeline item", () => {
    const achievement = {
      id: "ach-1",
      created_at: "2025-06-01T10:00:00Z",
      user_id: "user-1",
      mission_id: "mission-1",
      missions: { title: "First Mission", slug: "first-mission" },
    };

    const result = mapAchievementToTimeline(
      achievement,
      "user-1",
      mockProfile,
      mockPartyMembership,
    );

    expect(result).toEqual({
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
    const achievement = {
      id: "ach-2",
      created_at: "2025-06-01T10:00:00Z",
      user_id: "user-1",
      mission_id: "mission-1",
      missions: { title: "Mission", slug: "mission" },
    };

    const result = mapAchievementToTimeline(achievement, "user-1", null, null);

    expect(result.name).toBe("");
    expect(result.address_prefecture).toBeNull();
    expect(result.avatar_url).toBeNull();
    expect(result.party_membership).toBeNull();
  });
});

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

describe("mapActivityToTimeline", () => {
  it("maps a single activity to timeline item", () => {
    const activity = {
      id: "act-1",
      created_at: "2025-06-02T12:00:00Z",
      activity_title: "Signed up",
      activity_type: "signup",
      user_id: "user-1",
    };

    const result = mapActivityToTimeline(activity, "user-1", mockProfile, null);

    expect(result).toEqual({
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

  it("always sets mission_id and mission_slug to null", () => {
    const activity = {
      id: "act-2",
      created_at: "2025-06-02T12:00:00Z",
      activity_title: "Level Up",
      activity_type: "level_up",
      user_id: "user-1",
    };

    const result = mapActivityToTimeline(activity, "user-1", mockProfile, null);

    expect(result.mission_id).toBeNull();
    expect(result.mission_slug).toBeNull();
  });

  it("uses empty defaults when userProfile is null", () => {
    const activity = {
      id: "act-3",
      created_at: "2025-06-02T12:00:00Z",
      activity_title: "Activity",
      activity_type: "level_up",
      user_id: "user-1",
    };

    const result = mapActivityToTimeline(activity, "user-1", null, null);

    expect(result.name).toBe("");
    expect(result.address_prefecture).toBeNull();
    expect(result.avatar_url).toBeNull();
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

describe("extractValidUserIds", () => {
  it("returns empty array for empty input", () => {
    expect(extractValidUserIds([])).toEqual([]);
  });

  it("extracts valid user IDs", () => {
    const items = [
      { user_id: "user-1" },
      { user_id: "user-2" },
      { user_id: "user-3" },
    ];
    expect(extractValidUserIds(items)).toEqual(["user-1", "user-2", "user-3"]);
  });

  it("filters out null and undefined user_id values", () => {
    const items = [
      { user_id: "user-1" },
      { user_id: null },
      { user_id: undefined },
      { user_id: "user-2" },
    ];
    expect(extractValidUserIds(items)).toEqual(["user-1", "user-2"]);
  });

  it("filters out empty string user_id values", () => {
    const items = [{ user_id: "" }, { user_id: "user-1" }];
    expect(extractValidUserIds(items)).toEqual(["user-1"]);
  });
});

describe("enrichTimelineItemsWithMemberships", () => {
  const baseMembership = {
    user_id: "user-1",
    plan: "supporter",
    badge_visibility: true,
    metadata: null,
    synced_at: "2025-01-01T00:00:00Z",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  } as const;

  it("converts null fields to empty strings", () => {
    const items = [
      {
        id: null,
        user_id: null,
        name: null,
        address_prefecture: null,
        avatar_url: null,
        title: null,
        mission_id: null,
        created_at: null,
        activity_type: null,
      },
    ];

    const result = enrichTimelineItemsWithMemberships(items, {});

    expect(result[0]).toEqual({
      id: "",
      user_id: "",
      name: "",
      address_prefecture: null,
      avatar_url: null,
      title: "",
      mission_id: null,
      mission_slug: null,
      created_at: "",
      activity_type: "",
      party_membership: null,
    });
  });

  it("attaches membership when user has one", () => {
    const items = [
      {
        id: "item-1",
        user_id: "user-1",
        name: "Test User",
        address_prefecture: "Tokyo",
        avatar_url: "avatar.png",
        title: "Achievement",
        mission_id: "m-1",
        created_at: "2025-06-01T00:00:00Z",
        activity_type: "mission_achievement",
      },
    ];

    const result = enrichTimelineItemsWithMemberships(items, {
      "user-1": baseMembership,
    });

    expect(result[0].party_membership).toEqual(baseMembership);
  });

  it("sets party_membership to null when user has no membership", () => {
    const items = [
      {
        id: "item-1",
        user_id: "user-2",
        name: "Other User",
        address_prefecture: null,
        avatar_url: null,
        title: "Activity",
        mission_id: null,
        created_at: "2025-06-01T00:00:00Z",
        activity_type: "signup",
      },
    ];

    const result = enrichTimelineItemsWithMemberships(items, {
      "user-1": baseMembership,
    });

    expect(result[0].party_membership).toBeNull();
  });

  it("handles mission_slug string values", () => {
    const items = [
      {
        id: "item-1",
        user_id: "user-1",
        name: "User",
        address_prefecture: null,
        avatar_url: null,
        title: "Title",
        mission_id: "m-1",
        mission_slug: "my-mission",
        created_at: "2025-06-01T00:00:00Z",
        activity_type: "mission_achievement",
      },
    ];

    const result = enrichTimelineItemsWithMemberships(items, {});
    expect(result[0].mission_slug).toBe("my-mission");
  });

  it("sets mission_slug to null for non-string values", () => {
    const items = [
      {
        id: "item-1",
        user_id: "user-1",
        name: "User",
        address_prefecture: null,
        avatar_url: null,
        title: "Title",
        mission_id: null,
        mission_slug: 123,
        created_at: "2025-06-01T00:00:00Z",
        activity_type: "signup",
      },
    ];

    const result = enrichTimelineItemsWithMemberships(items, {});
    expect(result[0].mission_slug).toBeNull();
  });

  it("sets mission_slug to null when not present", () => {
    const items = [
      {
        id: "item-1",
        user_id: "user-1",
        name: "User",
        address_prefecture: null,
        avatar_url: null,
        title: "Title",
        mission_id: null,
        created_at: "2025-06-01T00:00:00Z",
        activity_type: "signup",
      },
    ];

    const result = enrichTimelineItemsWithMemberships(items, {});
    expect(result[0].mission_slug).toBeNull();
  });
});

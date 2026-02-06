import {
  groupMissionsByCategory,
  type MissionWithCategory,
} from "./mission-grouping";

function makeMission(
  id: string,
  title: string,
  category?: { id: string; category_title: string | null; sort_no: number },
): MissionWithCategory {
  return {
    id,
    title,
    mission_category_link: category ? [{ mission_category: category }] : [],
  } as unknown as MissionWithCategory;
}

describe("groupMissionsByCategory", () => {
  it("returns empty groups for empty input", () => {
    const result = groupMissionsByCategory([]);
    expect(result.sortedCategories).toHaveLength(0);
    expect(result.uncategorized).toHaveLength(0);
  });

  it("groups missions under a single category", () => {
    const missions = [
      makeMission("m1", "Mission 1", {
        id: "cat1",
        category_title: "Category A",
        sort_no: 1,
      }),
      makeMission("m2", "Mission 2", {
        id: "cat1",
        category_title: "Category A",
        sort_no: 1,
      }),
    ];

    const result = groupMissionsByCategory(missions);
    expect(result.sortedCategories).toHaveLength(1);
    expect(result.sortedCategories[0][0]).toBe("cat1");
    expect(result.sortedCategories[0][1].category).toBe("Category A");
    expect(result.sortedCategories[0][1].missions).toHaveLength(2);
    expect(result.uncategorized).toHaveLength(0);
  });

  it("sorts multiple categories by sort_no", () => {
    const missions = [
      makeMission("m1", "Mission 1", {
        id: "cat2",
        category_title: "Category B",
        sort_no: 20,
      }),
      makeMission("m2", "Mission 2", {
        id: "cat1",
        category_title: "Category A",
        sort_no: 10,
      }),
      makeMission("m3", "Mission 3", {
        id: "cat3",
        category_title: "Category C",
        sort_no: 30,
      }),
    ];

    const result = groupMissionsByCategory(missions);
    expect(result.sortedCategories).toHaveLength(3);
    expect(result.sortedCategories[0][1].category).toBe("Category A");
    expect(result.sortedCategories[1][1].category).toBe("Category B");
    expect(result.sortedCategories[2][1].category).toBe("Category C");
  });

  it("puts missions without category link into uncategorized", () => {
    const missions = [makeMission("m1", "No Category Mission")];

    const result = groupMissionsByCategory(missions);
    expect(result.sortedCategories).toHaveLength(0);
    expect(result.uncategorized).toHaveLength(1);
    expect(result.uncategorized[0].id).toBe("m1");
  });

  it("puts missions with null category_title into uncategorized", () => {
    const missions = [
      makeMission("m1", "Null Title", {
        id: "cat1",
        category_title: null,
        sort_no: 1,
      }),
    ];

    const result = groupMissionsByCategory(missions);
    expect(result.sortedCategories).toHaveLength(0);
    expect(result.uncategorized).toHaveLength(1);
  });

  it("handles mix of categorized and uncategorized missions", () => {
    const missions = [
      makeMission("m1", "Categorized", {
        id: "cat1",
        category_title: "Category A",
        sort_no: 1,
      }),
      makeMission("m2", "Uncategorized"),
      makeMission("m3", "Also Categorized", {
        id: "cat1",
        category_title: "Category A",
        sort_no: 1,
      }),
    ];

    const result = groupMissionsByCategory(missions);
    expect(result.sortedCategories).toHaveLength(1);
    expect(result.sortedCategories[0][1].missions).toHaveLength(2);
    expect(result.uncategorized).toHaveLength(1);
    expect(result.uncategorized[0].id).toBe("m2");
  });

  it("handles mission_category_link with null mission_category", () => {
    const mission = {
      id: "m1",
      title: "Test",
      mission_category_link: [{ mission_category: null }],
    } as unknown as MissionWithCategory;

    const result = groupMissionsByCategory([mission]);
    expect(result.sortedCategories).toHaveLength(0);
    expect(result.uncategorized).toHaveLength(1);
  });
});

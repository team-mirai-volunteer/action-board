import { createLookupMap, formatChartDates } from "./chart-transforms";

describe("formatChartDates", () => {
  it("should format date strings to Japanese short format", () => {
    const data = [
      { date: "2025-01-05", count: 10 },
      { date: "2025-12-25", count: 20 },
    ];

    const result = formatChartDates(data);

    expect(result[0].date).toBe(
      new Date("2025-01-05").toLocaleDateString("ja-JP", {
        month: "short",
        day: "numeric",
      }),
    );
    expect(result[1].date).toBe(
      new Date("2025-12-25").toLocaleDateString("ja-JP", {
        month: "short",
        day: "numeric",
      }),
    );
  });

  it("should preserve other properties in the data items", () => {
    const data = [{ date: "2025-03-15", count: 42, extra: "value" }];

    const result = formatChartDates(data);

    expect(result[0].count).toBe(42);
    expect(result[0].extra).toBe("value");
  });

  it("should return empty array for empty input", () => {
    expect(formatChartDates([])).toEqual([]);
  });

  it("should handle single item array", () => {
    const data = [{ date: "2025-06-01", count: 5 }];

    const result = formatChartDates(data);

    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(5);
  });

  it("should work with items that have multiple numeric fields", () => {
    const data = [{ date: "2025-01-01", total_views: 1000, total_likes: 50 }];

    const result = formatChartDates(data);

    expect(result[0].total_views).toBe(1000);
    expect(result[0].total_likes).toBe(50);
    expect(typeof result[0].date).toBe("string");
  });

  it("should handle consecutive dates correctly", () => {
    const data = [
      { date: "2025-01-01", count: 1 },
      { date: "2025-01-02", count: 2 },
      { date: "2025-01-03", count: 3 },
    ];

    const result = formatChartDates(data);

    expect(result).toHaveLength(3);
    // Each date should be distinct
    const dates = result.map((r) => r.date);
    expect(new Set(dates).size).toBe(3);
  });
});

describe("createLookupMap", () => {
  it("should create a Map from an array using the specified key", () => {
    const items = [
      { prefecture: "東京都", rank: 1, totalXp: 1000 },
      { prefecture: "大阪府", rank: 2, totalXp: 800 },
    ];

    const map = createLookupMap(items, "prefecture");

    expect(map.get("東京都")).toEqual({
      prefecture: "東京都",
      rank: 1,
      totalXp: 1000,
    });
    expect(map.get("大阪府")).toEqual({
      prefecture: "大阪府",
      rank: 2,
      totalXp: 800,
    });
  });

  it("should return undefined for missing keys", () => {
    const items = [{ id: "a", name: "Alice" }];

    const map = createLookupMap(items, "id");

    expect(map.get("b")).toBeUndefined();
  });

  it("should handle empty array", () => {
    const map = createLookupMap([], "id" as never);

    expect(map.size).toBe(0);
  });

  it("should handle numeric keys", () => {
    const items = [
      { id: 1, value: "first" },
      { id: 2, value: "second" },
    ];

    const map = createLookupMap(items, "id");

    expect(map.get(1)?.value).toBe("first");
    expect(map.get(2)?.value).toBe("second");
  });

  it("should use the last item when keys are duplicated", () => {
    const items = [
      { name: "Tokyo", rank: 1 },
      { name: "Tokyo", rank: 5 },
    ];

    const map = createLookupMap(items, "name");

    expect(map.get("Tokyo")?.rank).toBe(5);
    expect(map.size).toBe(1);
  });

  it("should create correct size map", () => {
    const items = [
      {
        prefecture: "北海道",
        rank: 1,
        xpPerCapita: 100,
        totalXp: 500,
        userCount: 10,
      },
      {
        prefecture: "青森県",
        rank: 2,
        xpPerCapita: 90,
        totalXp: 400,
        userCount: 8,
      },
      {
        prefecture: "岩手県",
        rank: 3,
        xpPerCapita: 80,
        totalXp: 300,
        userCount: 6,
      },
    ];

    const map = createLookupMap(items, "prefecture");

    expect(map.size).toBe(3);
  });
});

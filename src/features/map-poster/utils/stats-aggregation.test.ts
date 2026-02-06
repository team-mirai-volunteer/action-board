import type { Database } from "@/lib/types/supabase";
import {
  aggregateBoardStats,
  aggregateBoardsByPrefecture,
  type BoardStatsRow,
} from "./stats-aggregation";

type BoardStatus = Database["public"]["Enums"]["poster_board_status"];

const ALL_STATUSES: BoardStatus[] = [
  "not_yet",
  "not_yet_dangerous",
  "reserved",
  "done",
  "error_wrong_place",
  "error_damaged",
  "error_wrong_poster",
  "other",
];

describe("aggregateBoardStats", () => {
  it("returns empty stats for empty data", () => {
    const result = aggregateBoardStats([]);

    expect(result.stats).toEqual({});
    expect(result.total).toBe(0);
    expect(result.completed).toBe(0);
  });

  it("aggregates a single row correctly", () => {
    const data: BoardStatsRow[] = [
      { prefecture: "東京都", status: "done", count: 10 },
    ];

    const result = aggregateBoardStats(data);

    expect(result.stats["東京都"].done).toBe(10);
    expect(result.total).toBe(10);
    expect(result.completed).toBe(10);
  });

  it("aggregates multiple prefectures", () => {
    const data: BoardStatsRow[] = [
      { prefecture: "東京都", status: "done", count: 10 },
      { prefecture: "東京都", status: "not_yet", count: 20 },
      { prefecture: "大阪府", status: "reserved", count: 5 },
    ];

    const result = aggregateBoardStats(data);

    expect(result.stats["東京都"].done).toBe(10);
    expect(result.stats["東京都"].not_yet).toBe(20);
    expect(result.stats["大阪府"].reserved).toBe(5);
    expect(result.total).toBe(35);
    expect(result.completed).toBe(10);
  });

  it("initializes all status fields to zero", () => {
    const data: BoardStatsRow[] = [
      { prefecture: "北海道", status: "done", count: 3 },
    ];

    const result = aggregateBoardStats(data);

    for (const status of ALL_STATUSES) {
      expect(typeof result.stats["北海道"][status]).toBe("number");
    }
    expect(result.stats["北海道"].done).toBe(3);
    expect(result.stats["北海道"].not_yet).toBe(0);
    expect(result.stats["北海道"].reserved).toBe(0);
  });

  it("only counts 'done' status as completed", () => {
    const data: BoardStatsRow[] = [
      { prefecture: "東京都", status: "done", count: 5 },
      { prefecture: "東京都", status: "reserved", count: 10 },
      { prefecture: "東京都", status: "not_yet", count: 15 },
    ];

    const result = aggregateBoardStats(data);

    expect(result.completed).toBe(5);
    expect(result.total).toBe(30);
  });

  it("handles all status types", () => {
    const data: BoardStatsRow[] = ALL_STATUSES.map((status, i) => ({
      prefecture: "東京都",
      status,
      count: i + 1,
    }));

    const result = aggregateBoardStats(data);

    for (let i = 0; i < ALL_STATUSES.length; i++) {
      expect(result.stats["東京都"][ALL_STATUSES[i]]).toBe(i + 1);
    }
    // Total = 1+2+3+4+5+6+7+8 = 36
    expect(result.total).toBe(36);
    // "done" is at index 3, so count = 4
    expect(result.completed).toBe(4);
  });
});

describe("aggregateBoardsByPrefecture", () => {
  it("returns empty stats for empty array", () => {
    const result = aggregateBoardsByPrefecture([]);

    expect(result.stats).toEqual({});
    expect(result.total).toBe(0);
    expect(result.completed).toBe(0);
  });

  it("aggregates a single board correctly", () => {
    const boards: { prefecture: string; status: BoardStatus }[] = [
      { prefecture: "東京都", status: "done" },
    ];

    const result = aggregateBoardsByPrefecture(boards);

    expect(result.stats["東京都"].done).toBe(1);
    expect(result.total).toBe(1);
    expect(result.completed).toBe(1);
  });

  it("aggregates multiple boards across prefectures", () => {
    const boards: { prefecture: string; status: BoardStatus }[] = [
      { prefecture: "東京都", status: "done" },
      { prefecture: "東京都", status: "done" },
      { prefecture: "東京都", status: "not_yet" },
      { prefecture: "大阪府", status: "reserved" },
      { prefecture: "大阪府", status: "not_yet" },
    ];

    const result = aggregateBoardsByPrefecture(boards);

    expect(result.stats["東京都"].done).toBe(2);
    expect(result.stats["東京都"].not_yet).toBe(1);
    expect(result.stats["大阪府"].reserved).toBe(1);
    expect(result.stats["大阪府"].not_yet).toBe(1);
    expect(result.total).toBe(5);
    expect(result.completed).toBe(2);
  });

  it("initializes all status fields to zero", () => {
    const boards: { prefecture: string; status: BoardStatus }[] = [
      { prefecture: "福岡県", status: "not_yet" },
    ];

    const result = aggregateBoardsByPrefecture(boards);

    for (const status of ALL_STATUSES) {
      expect(typeof result.stats["福岡県"][status]).toBe("number");
    }
    expect(result.stats["福岡県"].not_yet).toBe(1);
    expect(result.stats["福岡県"].done).toBe(0);
  });

  it("correctly counts total and completed", () => {
    const boards: { prefecture: string; status: BoardStatus }[] = [
      { prefecture: "東京都", status: "done" },
      { prefecture: "東京都", status: "reserved" },
      { prefecture: "大阪府", status: "done" },
      { prefecture: "大阪府", status: "error_damaged" },
      { prefecture: "北海道", status: "not_yet" },
    ];

    const result = aggregateBoardsByPrefecture(boards);

    expect(result.total).toBe(5);
    expect(result.completed).toBe(2);
  });
});

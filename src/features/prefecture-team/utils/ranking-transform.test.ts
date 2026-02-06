import {
  type PrefectureTeamRankingRow,
  transformToXpPerCapitaRanking,
} from "./ranking-transform";

describe("transformToXpPerCapitaRanking", () => {
  it("returns empty array for empty data", () => {
    expect(transformToXpPerCapitaRanking([])).toEqual([]);
  });

  it("transforms a single prefecture correctly", () => {
    const data: PrefectureTeamRankingRow[] = [
      { prefecture: "東京都", total_xp: 10000, user_count: 50 },
    ];

    const result = transformToXpPerCapitaRanking(data);

    expect(result).toHaveLength(1);
    expect(result[0].prefecture).toBe("東京都");
    expect(result[0].totalXp).toBe(10000);
    expect(result[0].userCount).toBe(50);
    expect(result[0].rank).toBe(1);
    expect(typeof result[0].xpPerCapita).toBe("number");
    expect(result[0].xpPerCapita).toBeGreaterThan(0);
  });

  it("filters out unknown prefectures", () => {
    const data: PrefectureTeamRankingRow[] = [
      { prefecture: "東京都", total_xp: 10000, user_count: 50 },
      { prefecture: "不明", total_xp: 5000, user_count: 10 },
      { prefecture: "海外", total_xp: 3000, user_count: 5 },
    ];

    const result = transformToXpPerCapitaRanking(data);

    expect(result).toHaveLength(1);
    expect(result[0].prefecture).toBe("東京都");
  });

  it("sorts by xpPerCapita in descending order", () => {
    const data: PrefectureTeamRankingRow[] = [
      // 東京都 population ~14,178,000 => lower per-capita
      { prefecture: "東京都", total_xp: 100000, user_count: 500 },
      // 鳥取県 population ~531,000 => higher per-capita with same XP
      { prefecture: "鳥取県", total_xp: 100000, user_count: 200 },
    ];

    const result = transformToXpPerCapitaRanking(data);

    expect(result).toHaveLength(2);
    // 鳥取県 should rank first (smaller population => higher per-capita)
    expect(result[0].prefecture).toBe("鳥取県");
    expect(result[1].prefecture).toBe("東京都");
    expect(result[0].xpPerCapita).toBeGreaterThan(result[1].xpPerCapita);
  });

  it("assigns correct rank numbers", () => {
    const data: PrefectureTeamRankingRow[] = [
      { prefecture: "東京都", total_xp: 100000, user_count: 500 },
      { prefecture: "鳥取県", total_xp: 100000, user_count: 200 },
      { prefecture: "大阪府", total_xp: 50000, user_count: 300 },
    ];

    const result = transformToXpPerCapitaRanking(data);

    expect(result).toHaveLength(3);
    expect(result[0].rank).toBe(1);
    expect(result[1].rank).toBe(2);
    expect(result[2].rank).toBe(3);
  });

  it("handles multiple prefectures with varying data", () => {
    const data: PrefectureTeamRankingRow[] = [
      { prefecture: "北海道", total_xp: 50000, user_count: 100 },
      { prefecture: "沖縄県", total_xp: 30000, user_count: 80 },
      { prefecture: "愛知県", total_xp: 70000, user_count: 200 },
      { prefecture: "福岡県", total_xp: 40000, user_count: 120 },
    ];

    const result = transformToXpPerCapitaRanking(data);

    expect(result).toHaveLength(4);
    // All should have sequential ranks
    for (let i = 0; i < result.length; i++) {
      expect(result[i].rank).toBe(i + 1);
    }
    // Should be sorted descending by xpPerCapita
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].xpPerCapita).toBeGreaterThanOrEqual(
        result[i + 1].xpPerCapita,
      );
    }
  });

  it("preserves totalXp and userCount in output", () => {
    const data: PrefectureTeamRankingRow[] = [
      { prefecture: "神奈川県", total_xp: 99999, user_count: 42 },
    ];

    const result = transformToXpPerCapitaRanking(data);

    expect(result[0].totalXp).toBe(99999);
    expect(result[0].userCount).toBe(42);
  });

  it("handles items where all entries are unknown prefectures", () => {
    const data: PrefectureTeamRankingRow[] = [
      { prefecture: "不明", total_xp: 5000, user_count: 10 },
      { prefecture: "未設定", total_xp: 3000, user_count: 5 },
    ];

    const result = transformToXpPerCapitaRanking(data);

    expect(result).toEqual([]);
  });
});

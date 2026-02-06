import type { UserBadge } from "../badge-types";
import { mapMissionDataToBadges } from "./badge-enrichment";

function makeBadge(overrides: Partial<UserBadge> = {}): UserBadge {
  return {
    id: "badge-1",
    user_id: "user-1",
    badge_type: "MISSION",
    sub_type: "mission-slug-1",
    rank: 1,
    season_id: "season-1",
    achieved_at: "2025-01-01T00:00:00Z",
    is_notified: false,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("mapMissionDataToBadges", () => {
  it("MISSIONバッジにmission_titleとmission_idを付与する", () => {
    const badges: UserBadge[] = [
      makeBadge({ sub_type: "slug-a" }),
      makeBadge({ id: "badge-2", sub_type: "slug-b" }),
    ];
    const missionMap = new Map([
      ["slug-a", { title: "ミッションA", id: "id-a" }],
      ["slug-b", { title: "ミッションB", id: "id-b" }],
    ]);

    const result = mapMissionDataToBadges(badges, missionMap);

    expect(result[0].mission_title).toBe("ミッションA");
    expect(result[0].mission_id).toBe("id-a");
    expect(result[1].mission_title).toBe("ミッションB");
    expect(result[1].mission_id).toBe("id-b");
  });

  it("非MISSIONバッジはそのまま返す", () => {
    const badges: UserBadge[] = [
      makeBadge({ badge_type: "DAILY", sub_type: null }),
      makeBadge({ badge_type: "ALL", sub_type: null }),
      makeBadge({ badge_type: "PREFECTURE", sub_type: "東京都" }),
    ];
    const missionMap = new Map([
      ["slug-a", { title: "ミッションA", id: "id-a" }],
    ]);

    const result = mapMissionDataToBadges(badges, missionMap);

    expect(result[0]).toEqual(badges[0]);
    expect(result[1]).toEqual(badges[1]);
    expect(result[2]).toEqual(badges[2]);
    expect(result[0].mission_title).toBeUndefined();
    expect(result[0].mission_id).toBeUndefined();
  });

  it("missionMapに存在しないslugのバッジは変更されない", () => {
    const badges: UserBadge[] = [makeBadge({ sub_type: "unknown-slug" })];
    const missionMap = new Map([
      ["slug-a", { title: "ミッションA", id: "id-a" }],
    ]);

    const result = mapMissionDataToBadges(badges, missionMap);

    expect(result[0].mission_title).toBeUndefined();
    expect(result[0].mission_id).toBeUndefined();
    expect(result[0].sub_type).toBe("unknown-slug");
  });

  it("空配列の場合は空配列を返す", () => {
    const missionMap = new Map([
      ["slug-a", { title: "ミッションA", id: "id-a" }],
    ]);

    const result = mapMissionDataToBadges([], missionMap);

    expect(result).toEqual([]);
  });

  it("sub_typeがnullのMISSIONバッジは変更されない", () => {
    const badges: UserBadge[] = [
      makeBadge({ badge_type: "MISSION", sub_type: null }),
    ];
    const missionMap = new Map([
      ["slug-a", { title: "ミッションA", id: "id-a" }],
    ]);

    const result = mapMissionDataToBadges(badges, missionMap);

    expect(result[0].mission_title).toBeUndefined();
    expect(result[0].mission_id).toBeUndefined();
  });

  it("元の配列を変更しない（イミュータブル）", () => {
    const original: UserBadge[] = [makeBadge({ sub_type: "slug-a" })];
    const missionMap = new Map([
      ["slug-a", { title: "ミッションA", id: "id-a" }],
    ]);

    const result = mapMissionDataToBadges(original, missionMap);

    expect(result[0]).not.toBe(original[0]);
    expect(original[0].mission_title).toBeUndefined();
  });
});

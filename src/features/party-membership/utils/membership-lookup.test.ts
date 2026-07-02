import type { PartyMembership } from "../types";
import { buildMembershipLookupResponse } from "./membership-lookup";

const SITE_URL = "https://action.example.com";

function createMembership(
  overrides: Partial<PartyMembership> = {},
): PartyMembership {
  return {
    user_id: "user-1",
    plan: "regular",
    badge_visibility: true,
    synced_at: "2026-07-01T00:30:00+09:00",
    metadata: null,
    created_at: "2026-06-01T00:00:00+09:00",
    updated_at: "2026-07-01T00:30:00+09:00",
    ...overrides,
  } as PartyMembership;
}

describe("buildMembershipLookupResponse", () => {
  it("ユーザーが存在しない場合、userExists: falseと診断ヒントを返す", () => {
    const response = buildMembershipLookupResponse(
      { userExists: false, userId: null, membership: null },
      SITE_URL,
    );

    expect(response.userExists).toBe(false);
    expect(response.profileUrl).toBeNull();
    expect(response.partyMembership).toBeNull();
    expect(response.notes.join("")).toContain("見つかりません");
    expect(response.notes.join("")).toContain("LINEログイン");
  });

  it("ユーザーは存在するが党員データがない場合、profileUrlと原因候補を返す", () => {
    const response = buildMembershipLookupResponse(
      { userExists: true, userId: "user-1", membership: null },
      SITE_URL,
    );

    expect(response.userExists).toBe(true);
    expect(response.profileUrl).toBe("https://action.example.com/users/user-1");
    expect(response.partyMembership).toBeNull();
    expect(response.notes.join("")).toContain("同期されていません");
  });

  it("党員データがありバッジ表示ONの場合、プラン情報を返す", () => {
    const response = buildMembershipLookupResponse(
      {
        userExists: true,
        userId: "user-1",
        membership: createMembership(),
      },
      SITE_URL,
    );

    expect(response.partyMembership).toEqual({
      plan: "regular",
      planLabel: "レギュラープラン",
      badgeVisible: true,
      syncedAt: "2026-07-01T00:30:00+09:00",
    });
    expect(response.notes.join("")).toContain("表示される状態");
  });

  it("バッジ表示OFFの場合、badgeVisible: falseと設定変更の案内を返す", () => {
    const response = buildMembershipLookupResponse(
      {
        userExists: true,
        userId: "user-1",
        membership: createMembership({ badge_visibility: false }),
      },
      SITE_URL,
    );

    expect(response.partyMembership?.badgeVisible).toBe(false);
    expect(response.notes.join("")).toContain("非表示");
  });

  it("siteUrl末尾のスラッシュを除去してprofileUrlを組み立てる", () => {
    const response = buildMembershipLookupResponse(
      { userExists: true, userId: "user-1", membership: null },
      "https://action.example.com/",
    );

    expect(response.profileUrl).toBe("https://action.example.com/users/user-1");
  });
});

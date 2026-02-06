import type { PartyMembership } from "./types";
import { isPartyBadgeVisible } from "./utils";

const baseMembership: PartyMembership = {
  user_id: "test-user-id",
  plan: "standard",
  badge_visibility: true,
  metadata: {},
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  synced_at: "2024-01-01T00:00:00Z",
};

describe("isPartyBadgeVisible", () => {
  describe("membership が未定義の場合", () => {
    test("undefined の場合は false を返す", () => {
      expect(isPartyBadgeVisible(undefined)).toBe(false);
    });

    test("null の場合は false を返す", () => {
      expect(isPartyBadgeVisible(null)).toBe(false);
    });
  });

  describe("membership が存在する場合", () => {
    test("badge_visibility が true の場合は true を返す", () => {
      expect(
        isPartyBadgeVisible({ ...baseMembership, badge_visibility: true }),
      ).toBe(true);
    });

    test("badge_visibility が false の場合は false を返す", () => {
      expect(
        isPartyBadgeVisible({ ...baseMembership, badge_visibility: false }),
      ).toBe(false);
    });
  });
});

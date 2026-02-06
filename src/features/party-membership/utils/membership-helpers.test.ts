import type { PartyMembership } from "../types";
import { buildMembershipMap, deduplicateUserIds } from "./membership-helpers";

describe("deduplicateUserIds", () => {
  it("removes duplicate IDs", () => {
    const result = deduplicateUserIds(["a", "b", "a", "c", "b"]);
    expect(result).toEqual(["a", "b", "c"]);
  });

  it("filters out empty strings", () => {
    const result = deduplicateUserIds(["a", "", "b", ""]);
    expect(result).toEqual(["a", "b"]);
  });

  it("returns empty array when input is empty", () => {
    const result = deduplicateUserIds([]);
    expect(result).toEqual([]);
  });
});

describe("buildMembershipMap", () => {
  const makeMembership = (userId: string): PartyMembership =>
    ({
      user_id: userId,
      plan: "standard",
    }) as unknown as PartyMembership;

  it("converts array to map keyed by user_id", () => {
    const memberships = [makeMembership("user-1"), makeMembership("user-2")];
    const result = buildMembershipMap(memberships);
    expect(Object.keys(result)).toEqual(["user-1", "user-2"]);
    expect(result["user-1"]!.user_id).toBe("user-1");
    expect(result["user-2"]!.user_id).toBe("user-2");
  });

  it("returns empty object for empty array", () => {
    expect(buildMembershipMap([])).toEqual({});
  });

  it("skips entries with null user_id", () => {
    const memberships = [
      makeMembership("user-1"),
      { user_id: null, plan: "standard" } as unknown as PartyMembership,
    ];
    const result = buildMembershipMap(memberships);
    expect(Object.keys(result)).toEqual(["user-1"]);
  });

  it("last entry wins when duplicate user_ids exist", () => {
    const first = {
      user_id: "user-1",
      plan: "basic",
    } as unknown as PartyMembership;
    const second = {
      user_id: "user-1",
      plan: "premium",
    } as unknown as PartyMembership;
    const result = buildMembershipMap([first, second]);
    expect(result["user-1"]).toBe(second);
  });
});

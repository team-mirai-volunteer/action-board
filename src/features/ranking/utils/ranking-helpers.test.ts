import type { PartyMembership } from "@/features/party-membership/types";
import { attachPartyMembership } from "./ranking-helpers";

describe("ranking-helpers", () => {
  describe("attachPartyMembership", () => {
    const mockMembership: PartyMembership = {
      user_id: "user-1",
      plan: "regular",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
      synced_at: "2025-01-01T00:00:00Z",
      badge_visibility: true,
      metadata: {},
    };

    const membershipMap: Record<string, PartyMembership> = {
      "user-1": mockMembership,
    };

    it("membershipMapにuser_idが存在する場合、party_membershipを付与する", () => {
      const rankings = [
        { user_id: "user-1" as string | null, name: "ユーザー1", rank: 1 },
      ];

      const result = attachPartyMembership(rankings, membershipMap);

      expect(result).toHaveLength(1);
      expect(result[0].party_membership).toEqual(mockMembership);
      expect(result[0].name).toBe("ユーザー1");
      expect(result[0].rank).toBe(1);
    });

    it("membershipMapにuser_idが存在しない場合、party_membershipはnullになる", () => {
      const rankings = [
        {
          user_id: "user-999" as string | null,
          name: "未登録ユーザー",
          rank: 2,
        },
      ];

      const result = attachPartyMembership(rankings, membershipMap);

      expect(result).toHaveLength(1);
      expect(result[0].party_membership).toBeNull();
    });

    it("user_idがnullの場合、party_membershipはnullになる", () => {
      const rankings = [
        { user_id: null as string | null, name: "匿名ユーザー", rank: 3 },
      ];

      const result = attachPartyMembership(rankings, membershipMap);

      expect(result).toHaveLength(1);
      expect(result[0].party_membership).toBeNull();
    });

    it("空配列を渡した場合、空配列を返す", () => {
      const rankings: { user_id: string | null; name: string; rank: number }[] =
        [];

      const result = attachPartyMembership(rankings, membershipMap);

      expect(result).toHaveLength(0);
    });

    it("複数のランキングデータに対して正しくmembershipを付与する", () => {
      const extendedMap: Record<string, PartyMembership> = {
        "user-1": mockMembership,
        "user-2": {
          ...mockMembership,
          user_id: "user-2",
          plan: "supporter",
        },
      };

      const rankings = [
        { user_id: "user-1" as string | null, name: "ユーザー1", rank: 1 },
        { user_id: "user-2" as string | null, name: "ユーザー2", rank: 2 },
        { user_id: "user-3" as string | null, name: "ユーザー3", rank: 3 },
      ];

      const result = attachPartyMembership(rankings, extendedMap);

      expect(result).toHaveLength(3);
      expect(result[0].party_membership).toEqual(mockMembership);
      expect(result[1].party_membership?.plan).toBe("supporter");
      expect(result[2].party_membership).toBeNull();
    });
  });
});

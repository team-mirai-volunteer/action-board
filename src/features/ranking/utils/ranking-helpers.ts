import type { PartyMembership } from "@/features/party-membership/types";

type MembershipMap = Record<string, PartyMembership>;

/**
 * ランキングデータにparty_membership情報を付与する
 * user_idフィールドを持つオブジェクトの配列にmembershipMapからマッチするメンバーシップを追加する
 */
export function attachPartyMembership<T extends { user_id: string | null }>(
  rankings: T[],
  membershipMap: MembershipMap,
): (T & { party_membership: PartyMembership | null })[] {
  return rankings.map((ranking) => ({
    ...ranking,
    party_membership:
      ranking.user_id && membershipMap[ranking.user_id]
        ? membershipMap[ranking.user_id]
        : null,
  }));
}

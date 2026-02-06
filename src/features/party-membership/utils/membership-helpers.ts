import type { PartyMembership } from "../types";

type MembershipMap = Record<string, PartyMembership>;

/**
 * ユーザーID配列から重複と空値を除去する
 */
export function deduplicateUserIds(userIds: string[]): string[] {
  return Array.from(new Set(userIds.filter(Boolean)));
}

/**
 * メンバーシップ配列をuser_idをキーとするMapに変換する
 */
export function buildMembershipMap(
  memberships: PartyMembership[],
): MembershipMap {
  return memberships.reduce<MembershipMap>((acc, membership) => {
    if (membership?.user_id) {
      acc[membership.user_id] = membership;
    }
    return acc;
  }, {});
}

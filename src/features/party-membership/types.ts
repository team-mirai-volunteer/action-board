import type { Tables } from "@/lib/types/supabase";

export type PartyMembership = Tables<"party_memberships">;

export type PartyPlan = PartyMembership["plan"];

/** メールアドレスによる党員情報検索の結果 */
export type PartyMembershipLookup = {
  userExists: boolean;
  userId: string | null;
  membership: PartyMembership | null;
};

import "server-only";

import { createAdminClient } from "@/lib/supabase/adminClient";
import type { PartyMembership } from "../types";

type MembershipMap = Record<string, PartyMembership>;

export async function getPartyMembership(
  userId: string,
): Promise<PartyMembership | null> {
  if (!userId) {
    return null;
  }

  const supabaseAdmin = await createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("party_memberships")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch party membership:", error);
    return null;
  }

  return data ?? null;
}

export async function getPartyMembershipMap(
  userIds: string[],
): Promise<MembershipMap> {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  if (uniqueIds.length === 0) {
    return {};
  }

  const supabaseAdmin = await createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("party_memberships")
    .select("*")
    .in("user_id", uniqueIds);

  if (error) {
    console.error("Failed to fetch party memberships:", error);
    return {};
  }

  return (data ?? []).reduce<MembershipMap>((acc, membership) => {
    if (membership?.user_id) {
      acc[membership.user_id] = membership;
    }
    return acc;
  }, {});
}

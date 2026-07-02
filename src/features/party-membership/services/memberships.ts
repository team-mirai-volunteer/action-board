import "server-only";

import { createAdminClient } from "@/lib/supabase/adminClient";
import type { PartyMembership, PartyMembershipLookup } from "../types";
import {
  buildMembershipMap,
  deduplicateUserIds,
} from "../utils/membership-helpers";

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

/**
 * メールアドレスからアクションボードユーザーと党員情報を検索する
 *
 * 党員同期（sync-party-memberships）と同じく auth.users.email との
 * 小文字比較でマッチングする。問い合わせ対応用のMCPツールから利用される想定。
 */
export async function getPartyMembershipByEmail(
  email: string,
): Promise<PartyMembershipLookup> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return { userExists: false, userId: null, membership: null };
  }

  const supabaseAdmin = await createAdminClient();
  const { data: users, error: userError } = await supabaseAdmin.rpc(
    "get_users_by_emails",
    { email_list: [normalizedEmail] },
  );

  if (userError) {
    throw new Error(`ユーザーの検索に失敗しました: ${userError.message}`);
  }

  const userId = users?.[0]?.id ?? null;
  if (!userId) {
    return { userExists: false, userId: null, membership: null };
  }

  const { data: membership, error: membershipError } = await supabaseAdmin
    .from("party_memberships")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipError) {
    throw new Error(`党員情報の取得に失敗しました: ${membershipError.message}`);
  }

  return { userExists: true, userId, membership: membership ?? null };
}

export async function getPartyMembershipMap(
  userIds: string[],
): Promise<MembershipMap> {
  const uniqueIds = deduplicateUserIds(userIds);
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

  return buildMembershipMap(data ?? []);
}

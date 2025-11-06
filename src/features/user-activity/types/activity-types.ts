import type { PartyMembership } from "@/features/party-membership/types";

export interface ActivityTimelineItem {
  id: string;
  user_id: string;
  name: string;
  address_prefecture: string | null;
  avatar_url: string | null;
  title: string;
  created_at: string;
  activity_type: string;
  party_membership?: PartyMembership | null;
}

import type { PartyMembership } from "@/features/party-membership/types";

export interface ActivityTimelineItem {
  id: string;
  user_id: string;
  name: string;
  address_prefecture: string | null;
  avatar_url: string | null;
  title: string;
  mission_id: string | null;
  mission_slug: string | null;
  created_at: string;
  activity_type: string;
  party_membership?: PartyMembership | null;
}

export type ActivityType = "signup" | "mission_achievement" | "level_up";

export interface UserActivityRecord {
  userId: string;
  activityType: string;
  activityTitle: string;
}

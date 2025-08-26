export interface ActivityTimelineItem {
  id: string;
  user_id: string;
  name: string;
  address_prefecture: string | null;
  avatar_url: string | null;
  title: string;
  created_at: string;
  activity_type: string;
}

export type ActivityType = "signup" | "mission_achievement" | "level_up";

export interface UserActivityRecord {
  userId: string;
  activityType: string;
  activityTitle: string;
}

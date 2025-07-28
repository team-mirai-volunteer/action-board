import type { User } from "@supabase/supabase-js";
import type { Tables } from "../supabase";
import type { Achievement } from "./mission";

export type UserProfile = Tables<"public_user_profiles">;
export type PrivateUser = Tables<"private_users">;
export type UserLevel = Tables<"user_levels">;
export type XpTransaction = Tables<"xp_transactions">;

export interface ButtonLabelProps {
  authUser: User | null;
  achievement: Achievement | null;
  userAchievementCount: number;
  maxAchievementCount: number | null;
}

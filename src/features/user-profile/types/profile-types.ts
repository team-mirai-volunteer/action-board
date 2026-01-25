import type { Tables } from "@/lib/types/supabase";

export type PrivateUser = Tables<"private_users">;
export type PublicUserProfile = Tables<"public_user_profiles">;

export interface ProfileUpdateData {
  id: string;
  name?: string;
  avatar_url?: string;
  address_prefecture?: string;
  occupation?: string;
  birthday?: string;
  sns_x?: string;
  sns_instagram?: string;
  sns_facebook?: string;
  sns_website?: string;
}

export interface UserProfileProps {
  userId: string;
  showBadge?: boolean;
  size?: "sm" | "md" | "lg";
}

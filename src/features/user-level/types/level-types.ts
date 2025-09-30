import type { Tables, TablesInsert } from "@/lib/types/supabase";

export type UserLevel = Tables<"user_levels">;
export type XpTransaction = Tables<"xp_transactions">;
export type XpTransactionInsert = TablesInsert<"xp_transactions">;

export type XpSourceType =
  | "MISSION_COMPLETION"
  | "BONUS"
  | "PENALTY"
  | "MISSION_CANCELLATION";

export interface LevelUpNotification {
  shouldNotify: boolean;
  levelUp?: {
    previousLevel: number;
    newLevel: number;
    pointsToNextLevel: number;
  };
}

export interface XpGrantResult {
  success: boolean;
  userLevel?: UserLevel;
  xpGranted?: number;
  error?: string;
}

export interface BatchXpTransaction {
  userId: string;
  xpAmount: number;
  sourceType: XpSourceType;
  sourceId?: string;
  description?: string;
}

export interface BatchXpResult {
  success: boolean;
  results: Array<{
    userId: string;
    success: boolean;
    error?: string;
    newXp?: number;
    newLevel?: number;
  }>;
  error?: string;
}

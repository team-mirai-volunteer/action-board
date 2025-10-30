import type { Tables } from "@/lib/types/supabase";

export type PartyMembership = Tables<"party_memberships">;

export type PartyPlan = PartyMembership["plan"];

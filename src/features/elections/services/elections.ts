import { createAdminClient } from "@/lib/supabase/adminClient";
import type { Database } from "@/lib/types/supabase";

type Election = Database["public"]["Tables"]["elections"]["Row"];
export type { Election };

/**
 * Get all elections ordered by start date (most recent first)
 */
export async function getAllElections(): Promise<Election[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("elections")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Error fetching elections:", error);
    return [];
  }

  return data || [];
}

/**
 * Get a specific election by ID
 */
export async function getElectionById(
  electionId: string,
): Promise<Election | null> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("elections")
    .select("*")
    .eq("id", electionId)
    .single();

  if (error) {
    console.error("Error fetching election:", error);
    return null;
  }

  return data;
}

/**
 * Get the current or most recent election
 * (Elections with end_date >= now, ordered by start_date desc, or the most recent past election)
 */
export async function getCurrentElection(): Promise<Election | null> {
  const supabase = await createAdminClient();

  const now = new Date().toISOString();

  // First try to find an ongoing election
  const { data: ongoingElection, error: ongoingError } = await supabase
    .from("elections")
    .select("*")
    .gte("end_date", now)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (ongoingError) {
    console.error("Error fetching ongoing election:", ongoingError);
  }

  if (ongoingElection) {
    return ongoingElection;
  }

  // If no ongoing election, return the most recent past election
  const { data: pastElection, error: pastError } = await supabase
    .from("elections")
    .select("*")
    .order("end_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (pastError) {
    console.error("Error fetching past election:", pastError);
    return null;
  }

  return pastElection;
}

/**
 * Get elections by season
 */
export async function getElectionsBySeasonId(
  seasonId: string,
): Promise<Election[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("elections")
    .select("*")
    .eq("season_id", seasonId)
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Error fetching elections by season:", error);
    return [];
  }

  return data || [];
}

import { createAdminClient } from "@/lib/supabase/adminClient";
import type { Tables } from "@/lib/types/supabase";

export type PostingEvent = Tables<"posting_events">;

export async function getEventBySlug(
  slug: string,
): Promise<PostingEvent | null> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("posting_events")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    console.error("Error fetching event by slug:", error);
    throw error;
  }

  return data;
}

export async function getActiveEvent(): Promise<PostingEvent | null> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("posting_events")
    .select("*")
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No active event found
      return null;
    }
    console.error("Error fetching active event:", error);
    throw error;
  }

  return data;
}

export async function getAllEvents(): Promise<PostingEvent[]> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("posting_events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all events:", error);
    throw error;
  }

  return data || [];
}

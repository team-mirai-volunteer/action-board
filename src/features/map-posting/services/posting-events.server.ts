import "server-only";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/supabase";
import { cache } from "react";

export type PostingEvent = Tables<"posting_events">;

export const getEventBySlug = cache(
  async (slug: string): Promise<PostingEvent | null> => {
    const supabase = createClient();
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
  },
);

export const getActiveEvent = cache(async (): Promise<PostingEvent | null> => {
  const supabase = createClient();
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
});

export const getAllEvents = cache(async (): Promise<PostingEvent[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("posting_events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all events:", error);
    throw error;
  }

  return data || [];
});

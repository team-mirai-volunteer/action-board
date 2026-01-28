import type { SupabaseClient } from "@supabase/supabase-js";
import type { YouTubeVideoRecord, YouTubeVideoStatsRecord } from "./types.js";

export interface ExistingVideo {
  video_id: string; // PRIMARY KEY
  published_at: string | null;
}

export async function fetchExistingVideos(
  supabase: SupabaseClient,
): Promise<ExistingVideo[]> {
  const { data, error } = await supabase
    .from("youtube_videos")
    .select("video_id, published_at")
    .eq("is_active", true);

  if (error) {
    throw new Error(`Failed to fetch existing videos: ${error.message}`);
  }

  return data || [];
}

export async function insertVideo(
  supabase: SupabaseClient,
  record: YouTubeVideoRecord,
): Promise<string> {
  const { error } = await supabase.from("youtube_videos").insert(record);

  if (error) {
    throw new Error(
      `Failed to insert video ${record.video_id}: ${error.message}`,
    );
  }

  return record.video_id; // video_id がPRIMARY KEY
}

export async function upsertStats(
  supabase: SupabaseClient,
  record: YouTubeVideoStatsRecord,
): Promise<void> {
  const { error } = await supabase.from("youtube_video_stats").upsert(record, {
    onConflict: "video_id,recorded_at",
  });

  if (error) {
    throw new Error(`Failed to record stats: ${error.message}`);
  }
}

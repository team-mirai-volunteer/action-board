import * as path from "node:path";
import { createAdminClient } from "@/lib/supabase/adminClient";
import * as dotenv from "dotenv";

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Helper function for slug to ID mapping
export async function getPostingEventSlugToIdMap(): Promise<
  Record<string, string>
> {
  const supabaseAdmin = await createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("posting_events")
    .select("id, slug");

  if (error) throw error;

  const map: Record<string, string> = {};
  for (const event of data || []) {
    if (event.slug) map[event.slug] = event.id;
  }

  return map;
}

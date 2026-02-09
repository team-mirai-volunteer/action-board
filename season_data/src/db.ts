import * as path from "node:path";
import * as dotenv from "dotenv";
import { createAdminClient } from "@/lib/supabase/adminClient";

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Helper function for slug to ID mapping
export async function getSeasonSlugToIdMap(): Promise<Record<string, string>> {
  const supabaseAdmin = await createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("seasons")
    .select("id, slug");

  if (error) throw error;

  const map: Record<string, string> = {};
  for (const season of data || []) {
    if (season.slug) map[season.slug] = season.id;
  }

  return map;
}

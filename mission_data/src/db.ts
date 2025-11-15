import * as path from "node:path";
import { createAdminClient } from "@/lib/supabase/adminClient";
import * as dotenv from "dotenv";

// Load .env from project root
dotenv.config({ path: path.resolve(import.meta.dirname, "../../.env") });

// Helper functions for slug to ID mapping
export async function getCategorySlugToIdMap(): Promise<
  Record<string, string>
> {
  const supabaseAdmin = await createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("mission_category")
    .select("id, slug");

  if (error) throw error;

  const map: Record<string, string> = {};
  for (const cat of data || []) {
    if (cat.slug) map[cat.slug] = cat.id;
  }

  return map;
}

export async function getMissionSlugToIdMap(): Promise<Record<string, string>> {
  const supabaseAdmin = await createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("missions")
    .select("id, slug");

  if (error) throw error;

  const map: Record<string, string> = {};
  for (const mission of data || []) {
    if (mission.slug) map[mission.slug] = mission.id;
  }

  return map;
}

export async function getQuizCategorySlugToIdMap(): Promise<
  Record<string, string>
> {
  const supabaseAdmin = await createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("quiz_categories")
    .select("id, slug");

  if (error) throw error;

  const map: Record<string, string> = {};
  for (const cat of data || []) {
    if (cat.slug) map[cat.slug] = cat.id;
  }

  return map;
}

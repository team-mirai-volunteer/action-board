import * as path from "node:path";
import { createServiceClient } from "@/lib/supabase/server";
import * as dotenv from "dotenv";

// Load .env.local from project root
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

// Helper functions for slug to ID mapping
export async function getCategorySlugToIdMap(): Promise<
  Record<string, string>
> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
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
  const supabase = await createServiceClient();
  const { data, error } = await supabase.from("missions").select("id, slug");

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
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("quiz_categories")
    .select("id, slug");

  if (error) throw error;

  const map: Record<string, string> = {};
  for (const cat of data || []) {
    if (cat.slug) map[cat.slug] = cat.id;
  }

  return map;
}

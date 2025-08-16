import { createClient } from "@/lib/supabase/client";

export async function hasFeaturedMissions(): Promise<boolean> {
  const supabase = createClient();
  const { count } = await supabase
    .from("missions")
    .select("id", { count: "exact", head: true })
    .eq("is_featured", true);

  return !!count;
}

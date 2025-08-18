import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

// サービスロールでの操作を行うクライアントです。
// RLSが無効になりますのでご注意ください。
export const createAdminClient = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
  }

  if (!supabaseServiceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  }
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey);
};

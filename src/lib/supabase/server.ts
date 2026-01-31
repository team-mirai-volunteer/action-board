import type { Database } from "@/lib/types/supabase";
import { createServerClient } from "@supabase/ssr";
import type { cookies } from "next/headers";

export function createClient(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
  }

  if (!supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable",
    );
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component から setAll が呼ばれた場合はエラーになるため無視する
          // (Server Action や Route Handler では正常に動作します)
        }
      },
    },
  });
}

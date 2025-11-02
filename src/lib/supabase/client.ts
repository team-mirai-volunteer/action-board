import type { Database } from "@/lib/types/supabase";
import { createBrowserClient, createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 実行環境を自動判定してSupabaseクライアントを作成する透過的な関数
 * サーバー/クライアント問わず統一的に使用可能
 */
export function createClient(): SupabaseClient<Database> {
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

  // サーバーサイド実行かブラウザ実行かを判定
  const isServer = typeof window === "undefined";

  if (isServer) {
    // サーバーサイド: cookiesを使用したServerClient
    try {
      return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
        cookies: {
          async getAll() {
            const { cookies } = await import("next/headers");
            const cookieStore = await cookies();
            return cookieStore.getAll();
          },
          async setAll(cookiesToSet) {
            try {
              const { cookies } = await import("next/headers");
              const cookieStore = await cookies();
              for (const { name, value, options } of cookiesToSet) {
                cookieStore.set(name, value, options);
              }
            } catch {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      });
    } catch {
      // next/headersが利用できない場合（テスト環境など）はシンプルなServerClientを返す
      return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll: () => [],
          setAll: () => {},
        },
      });
    }
  }

  // クライアントサイド: BrowserClient
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

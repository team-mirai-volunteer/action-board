import { cookies } from "next/headers";

// サーバーサイドでのCookie操作
export async function setCookie(
  name: string,
  value: string,
  options?: {
    maxAge?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: "strict" | "lax" | "none";
  },
) {
  const cookieStore = await cookies();
  cookieStore.set(name, value, {
    maxAge: options?.maxAge || 60 * 60 * 24 * 30, // デフォルト30日
    path: options?.path || "/",
    domain: options?.domain,
    secure: options?.secure,
    httpOnly: options?.httpOnly || false,
    sameSite: options?.sameSite || "lax",
  });
}

// Cookieの取得
export async function getCookie(name: string): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value;
}

// Cookieの削除
export async function deleteCookie(
  name: string,
  options?: {
    path?: string;
    domain?: string;
  },
) {
  const cookieStore = await cookies();
  cookieStore.delete({
    name,
    path: options?.path || "/",
    domain: options?.domain,
  });
}

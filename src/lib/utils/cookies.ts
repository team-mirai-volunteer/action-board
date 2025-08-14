"use client";

// クライアントサイドでのCookie操作のみを提供
export function setClientCookie(
  name: string,
  value: string,
  options?: {
    maxAge?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
  },
) {
  if (typeof window === "undefined") return;

  const cookieOptions = [
    `max-age=${options?.maxAge || 60 * 60 * 24 * 30}`,
    `path=${options?.path || "/"}`,
  ];

  if (options?.domain) {
    cookieOptions.push(`domain=${options.domain}`);
  }
  if (options?.secure) {
    cookieOptions.push("secure");
  }
  if (options?.sameSite) {
    cookieOptions.push(`samesite=${options.sameSite}`);
  }

  document.cookie = `${name}=${value}; ${cookieOptions.join("; ")}`;
}

export function getClientCookie(name: string): string | undefined {
  if (typeof window === "undefined") return undefined;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift();
  }
  return undefined;
}

export function deleteClientCookie(
  name: string,
  options?: {
    path?: string;
    domain?: string;
  },
) {
  if (typeof window === "undefined") return;

  const cookieOptions = [`path=${options?.path || "/"}`, "max-age=0"];

  if (options?.domain) {
    cookieOptions.push(`domain=${options.domain}`);
  }

  document.cookie = `${name}=; ${cookieOptions.join("; ")}`;
}

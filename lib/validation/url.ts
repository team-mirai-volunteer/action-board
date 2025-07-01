/**
 * URL validation utilities to prevent open redirect vulnerabilities
 */

/**
 * Validates if a URL is safe for redirection
 * @param url - The URL to validate
 * @param allowedHosts - Optional array of allowed external hosts
 * @returns The validated URL if safe, null otherwise
 */
export function validateReturnUrl(
  url: string | undefined | null,
  allowedHosts: string[] = [],
): string | null {
  if (!url) {
    return null;
  }

  // Remove any leading/trailing whitespace
  const trimmedUrl = url.trim();

  // Check for common bypass attempts
  if (
    (trimmedUrl.includes("//") &&
      !trimmedUrl.startsWith("http://") &&
      !trimmedUrl.startsWith("https://")) ||
    trimmedUrl.includes("\\") ||
    trimmedUrl.includes("%00") ||
    trimmedUrl.includes("\n") ||
    trimmedUrl.includes("\r") ||
    trimmedUrl.startsWith("javascript:") ||
    trimmedUrl.startsWith("data:") ||
    trimmedUrl.startsWith("vbscript:") ||
    trimmedUrl.startsWith("file:")
  ) {
    return null;
  }

  // Handle relative URLs (they're safe as they stay on the same domain)
  if (trimmedUrl.startsWith("/") && !trimmedUrl.startsWith("//")) {
    // Ensure it's a valid path
    try {
      // Check if it's a valid URL path
      new URL(trimmedUrl, "http://example.com");
      return trimmedUrl;
    } catch {
      return null;
    }
  }

  // Parse absolute URLs
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmedUrl);
  } catch {
    // Not a valid absolute URL
    return null;
  }

  // Only allow HTTP and HTTPS protocols
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return null;
  }

  // Get current host from environment or default
  let currentHost: string;
  try {
    currentHost = process.env.NEXT_PUBLIC_APP_URL
      ? new URL(process.env.NEXT_PUBLIC_APP_URL).host
      : "localhost:3000";
  } catch {
    currentHost = "localhost:3000";
  }

  // Check if the host is allowed
  const isAllowedHost =
    parsedUrl.host === currentHost ||
    allowedHosts.includes(parsedUrl.host) ||
    // Allow localhost variations for development
    (process.env.NODE_ENV === "development" &&
      (parsedUrl.host === "localhost:3000" ||
        parsedUrl.host === "127.0.0.1:3000" ||
        parsedUrl.host === "[::1]:3000"));

  if (!isAllowedHost) {
    return null;
  }

  // Return the validated URL
  return parsedUrl.toString();
}

/**
 * Gets a safe default redirect URL
 */
export function getDefaultRedirectUrl(): string {
  return "/";
}

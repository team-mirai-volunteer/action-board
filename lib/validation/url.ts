/**
 * URL validation utilities to prevent open redirect vulnerabilities
 */

/**
 * Validates if a URL is safe for redirection (relative paths only)
 * @param url - The URL to validate
 * @returns The validated URL if safe, null otherwise
 */
export function validateReturnUrl(
  url: string | undefined | null,
): string | null {
  if (!url) {
    return null;
  }

  // Remove any leading/trailing whitespace
  const trimmedUrl = url.trim();

  // Check for common bypass attempts
  if (
    trimmedUrl.includes("//") ||
    trimmedUrl.includes("\\") ||
    trimmedUrl.includes("%00") ||
    trimmedUrl.includes("\n") ||
    trimmedUrl.includes("\r") ||
    trimmedUrl.startsWith("javascript:") ||
    trimmedUrl.startsWith("data:") ||
    trimmedUrl.startsWith("vbscript:") ||
    trimmedUrl.startsWith("file:") ||
    trimmedUrl.includes(":")
  ) {
    return null;
  }

  // Only allow relative URLs that start with /
  if (trimmedUrl.startsWith("/")) {
    // Ensure it's a valid path
    try {
      // Check if it's a valid URL path
      new URL(trimmedUrl, "http://example.com");
      return trimmedUrl;
    } catch {
      return null;
    }
  }

  // Reject everything else (including absolute URLs)
  return null;
}

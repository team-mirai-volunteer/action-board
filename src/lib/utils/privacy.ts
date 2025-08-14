/**
 * Masks a username for privacy protection
 * Shows first letter + x's for the length of the remaining username
 * e.g., "shota" -> "sxxxx", "john" -> "jxxx"
 *
 * @param username - The username to mask
 * @returns The masked username
 */
export function maskUsername(username: string | null | undefined): string {
  if (!username || username.length === 0) {
    return "";
  }

  // Get the first character and create x's for the rest
  const firstChar = username.charAt(0);
  const maskedRest = "x".repeat(username.length - 1);

  return firstChar + maskedRest;
}

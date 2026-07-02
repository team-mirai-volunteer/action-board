import { createHash, timingSafeEqual } from "node:crypto";

/**
 * AuthorizationヘッダのBearerトークンを期待値と照合する
 *
 * トークン長の違いによる情報漏洩を防ぐため、sha256ハッシュ化後に
 * timingSafeEqualで比較する（タイミング攻撃対策）
 */
export function verifyBearerToken(
  authHeader: string | null,
  expectedToken: string | undefined,
): boolean {
  if (!expectedToken) {
    return false;
  }

  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) {
    return false;
  }

  const tokenHash = createHash("sha256").update(token).digest();
  const expectedHash = createHash("sha256").update(expectedToken).digest();
  return timingSafeEqual(tokenHash, expectedHash);
}

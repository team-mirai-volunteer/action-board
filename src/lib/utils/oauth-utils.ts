/**
 * トークンの有効期限が切れているかどうかを判定する
 */
export function isTokenExpired(expiresAt: string | Date): boolean {
  return new Date(expiresAt) < new Date();
}

/**
 * OAuthスコープ文字列をスペース区切りで配列にパースする
 */
export function parseOAuthScopes(
  scopeString: string | null | undefined,
): string[] {
  if (!scopeString) {
    return [];
  }
  return scopeString.split(" ");
}

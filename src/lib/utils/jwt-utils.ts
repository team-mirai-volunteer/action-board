/**
 * JWTのIDトークンからペイロード部分をBase64デコードして返す。
 */
export function parseIdTokenPayload(idToken: string): Record<string, unknown> {
  const base64Payload = idToken.split(".")[1];
  return JSON.parse(Buffer.from(base64Payload, "base64").toString());
}

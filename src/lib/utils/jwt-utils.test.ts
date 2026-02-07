import { parseIdTokenPayload } from "./jwt-utils";

describe("parseIdTokenPayload", () => {
  function createJwt(payload: Record<string, unknown>): string {
    const header = Buffer.from(JSON.stringify({ alg: "RS256" })).toString(
      "base64",
    );
    const body = Buffer.from(JSON.stringify(payload)).toString("base64");
    return `${header}.${body}.signature`;
  }

  it("JWTからペイロードをデコードできる", () => {
    const payload = {
      sub: "user-123",
      name: "Test User",
      email: "test@example.com",
    };
    const token = createJwt(payload);
    const result = parseIdTokenPayload(token);
    expect(result).toEqual(payload);
  });

  it("日本語を含むペイロードをデコードできる", () => {
    const payload = { sub: "user-456", name: "テストユーザー" };
    const token = createJwt(payload);
    const result = parseIdTokenPayload(token);
    expect(result).toEqual(payload);
  });

  it("空のペイロードをデコードできる", () => {
    const token = createJwt({});
    const result = parseIdTokenPayload(token);
    expect(result).toEqual({});
  });

  it("数値やブール値を含むペイロードをデコードできる", () => {
    const payload = { iat: 1234567890, exp: 1234567899, email_verified: true };
    const token = createJwt(payload);
    const result = parseIdTokenPayload(token);
    expect(result).toEqual(payload);
  });

  it("不正なJWTの場合はエラーをスローする", () => {
    expect(() => parseIdTokenPayload("invalid")).toThrow();
  });
});

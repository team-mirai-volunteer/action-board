import { verifyBearerToken } from "./bearer-token";

describe("verifyBearerToken", () => {
  it("トークンが一致する場合はtrueを返す", () => {
    expect(verifyBearerToken("Bearer secret-token", "secret-token")).toBe(true);
  });

  it("トークンが一致しない場合はfalseを返す", () => {
    expect(verifyBearerToken("Bearer wrong-token", "secret-token")).toBe(false);
  });

  it("長さが異なるトークンでもエラーにならずfalseを返す", () => {
    expect(verifyBearerToken("Bearer short", "much-longer-secret-token")).toBe(
      false,
    );
  });

  it("Authorizationヘッダがnullの場合はfalseを返す", () => {
    expect(verifyBearerToken(null, "secret-token")).toBe(false);
  });

  it("Bearerプレフィックスがない場合はfalseを返す", () => {
    expect(verifyBearerToken("secret-token", "secret-token")).toBe(false);
  });

  it("Bearerの後が空の場合はfalseを返す", () => {
    expect(verifyBearerToken("Bearer ", "secret-token")).toBe(false);
  });

  it("期待値が未設定（undefined）の場合はfalseを返す", () => {
    expect(verifyBearerToken("Bearer secret-token", undefined)).toBe(false);
  });

  it("期待値が空文字の場合はfalseを返す", () => {
    expect(verifyBearerToken("Bearer ", "")).toBe(false);
  });
});

import { isTokenExpired, parseOAuthScopes } from "./oauth-utils";

describe("isTokenExpired", () => {
  it("過去の日時は期限切れと判定する", () => {
    const pastDate = new Date(Date.now() - 60 * 1000).toISOString();
    expect(isTokenExpired(pastDate)).toBe(true);
  });

  it("未来の日時は有効と判定する", () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    expect(isTokenExpired(futureDate)).toBe(false);
  });

  it("Date型の引数も受け付ける", () => {
    const pastDate = new Date(Date.now() - 60 * 1000);
    expect(isTokenExpired(pastDate)).toBe(true);

    const futureDate = new Date(Date.now() + 60 * 60 * 1000);
    expect(isTokenExpired(futureDate)).toBe(false);
  });

  it("ISO 8601文字列を正しくパースする", () => {
    expect(isTokenExpired("2020-01-01T00:00:00.000Z")).toBe(true);
    expect(isTokenExpired("2099-12-31T23:59:59.000Z")).toBe(false);
  });

  it("境界値: 1秒前は期限切れ", () => {
    const justPast = new Date(Date.now() - 1000).toISOString();
    expect(isTokenExpired(justPast)).toBe(true);
  });
});

describe("parseOAuthScopes", () => {
  it("スペース区切りの文字列を配列に分割する", () => {
    expect(parseOAuthScopes("read write profile")).toEqual([
      "read",
      "write",
      "profile",
    ]);
  });

  it("単一スコープの場合は1要素の配列を返す", () => {
    expect(parseOAuthScopes("read")).toEqual(["read"]);
  });

  it("nullの場合は空配列を返す", () => {
    expect(parseOAuthScopes(null)).toEqual([]);
  });

  it("undefinedの場合は空配列を返す", () => {
    expect(parseOAuthScopes(undefined)).toEqual([]);
  });

  it("空文字の場合は空配列を返す", () => {
    expect(parseOAuthScopes("")).toEqual([]);
  });
});

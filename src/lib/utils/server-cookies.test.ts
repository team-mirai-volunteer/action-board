import { cookies } from "next/headers";
import { deleteCookie, getCookie, setCookie } from "./server-cookies";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

const mockCookiesFn = cookies as jest.MockedFunction<typeof cookies>;

describe("server-cookies", () => {
  const mockSet = jest.fn();
  const mockGet = jest.fn();
  const mockDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    mockCookiesFn.mockResolvedValue({
      set: mockSet,
      get: mockGet,
      delete: mockDelete,
    } as any);
  });

  describe("setCookie", () => {
    it("デフォルトオプションでCookieを設定する", async () => {
      await setCookie("token", "abc123");

      expect(mockSet).toHaveBeenCalledWith("token", "abc123", {
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
        domain: undefined,
        secure: undefined,
        httpOnly: false,
        sameSite: "lax",
      });
    });

    it("カスタムオプションを上書き反映する", async () => {
      await setCookie("session", "xyz", {
        maxAge: 3600,
        path: "/admin",
        domain: "example.com",
        secure: true,
        httpOnly: true,
        sameSite: "strict",
      });

      expect(mockSet).toHaveBeenCalledWith("session", "xyz", {
        maxAge: 3600,
        path: "/admin",
        domain: "example.com",
        secure: true,
        httpOnly: true,
        sameSite: "strict",
      });
    });

    it("maxAgeが0でも未指定時と同様にデフォルト値が使われる", async () => {
      // 実装上 `options?.maxAge || default` なので0はfalsyとして扱われデフォルトに戻る
      await setCookie("k", "v", { maxAge: 0 });

      expect(mockSet).toHaveBeenCalledWith(
        "k",
        "v",
        expect.objectContaining({ maxAge: 60 * 60 * 24 * 30 }),
      );
    });
  });

  describe("getCookie", () => {
    it("存在するCookieの値を返す", async () => {
      mockGet.mockReturnValue({ value: "hello" });

      await expect(getCookie("greeting")).resolves.toBe("hello");
      expect(mockGet).toHaveBeenCalledWith("greeting");
    });

    it("存在しないCookieはundefinedを返す", async () => {
      mockGet.mockReturnValue(undefined);

      await expect(getCookie("missing")).resolves.toBeUndefined();
    });
  });

  describe("deleteCookie", () => {
    it("デフォルトオプションで削除する", async () => {
      await deleteCookie("token");

      expect(mockDelete).toHaveBeenCalledWith({
        name: "token",
        path: "/",
        domain: undefined,
      });
    });

    it("カスタムpath/domainを指定して削除できる", async () => {
      await deleteCookie("token", { path: "/admin", domain: "example.com" });

      expect(mockDelete).toHaveBeenCalledWith({
        name: "token",
        path: "/admin",
        domain: "example.com",
      });
    });
  });
});

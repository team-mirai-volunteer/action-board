import {
  deleteClientCookie,
  getClientCookie,
  setClientCookie,
} from "./cookies";

describe("cookies", () => {
  beforeEach(() => {
    // document.cookie をリセット
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/");
    });
  });

  describe("setClientCookie", () => {
    test("デフォルトオプションで cookie が設定される", () => {
      setClientCookie("test-name", "test-value");

      expect(document.cookie).toContain("test-name=test-value");
    });

    test("カスタムオプション（domain, secure, sameSite）で正しいcookie文字列が設定される", () => {
      const originalCookie = Object.getOwnPropertyDescriptor(
        Document.prototype,
        "cookie",
      );
      let setCookieValue = "";
      Object.defineProperty(document, "cookie", {
        get: () => setCookieValue,
        set: (val: string) => {
          setCookieValue = val;
        },
        configurable: true,
      });

      setClientCookie("custom", "value", {
        domain: ".example.com",
        secure: true,
        sameSite: "strict",
        maxAge: 3600,
        path: "/app",
      });

      expect(setCookieValue).toBe(
        "custom=value; max-age=3600; path=/app; domain=.example.com; secure; samesite=strict",
      );

      // 元に戻す
      if (originalCookie) {
        Object.defineProperty(document, "cookie", originalCookie);
      }
    });

    test("window === undefined（SSR）の場合、早期リターンする", () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error: windowを一時的にundefinedにする
      delete globalThis.window;

      const originalCookie = document.cookie;
      setClientCookie("ssr-test", "value");

      // windowがないので何も起きない（エラーにならない）
      globalThis.window = originalWindow;
      // jsdom環境ではdocument.cookieへの書き込みはwindowチェック後なので変化なし
    });
  });

  describe("getClientCookie", () => {
    test("存在するcookieを取得して正しい値を返す", () => {
      document.cookie = "my-cookie=hello";

      const result = getClientCookie("my-cookie");
      expect(result).toBe("hello");
    });

    test("存在しないcookieの場合、undefined を返す", () => {
      const result = getClientCookie("nonexistent");
      expect(result).toBeUndefined();
    });

    test("複数のcookieがある場合、正しいものを取得する", () => {
      document.cookie = "first=111";
      document.cookie = "second=222";
      document.cookie = "third=333";

      expect(getClientCookie("first")).toBe("111");
      expect(getClientCookie("second")).toBe("222");
      expect(getClientCookie("third")).toBe("333");
    });

    test("window === undefined の場合、undefined を返す", () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error: windowを一時的にundefinedにする
      delete globalThis.window;

      const result = getClientCookie("test");
      expect(result).toBeUndefined();

      globalThis.window = originalWindow;
    });
  });

  describe("deleteClientCookie", () => {
    test("cookie 削除で max-age=0 が設定される", () => {
      const originalCookie = Object.getOwnPropertyDescriptor(
        Document.prototype,
        "cookie",
      );
      let setCookieValue = "";
      Object.defineProperty(document, "cookie", {
        get: () => setCookieValue,
        set: (val: string) => {
          setCookieValue = val;
        },
        configurable: true,
      });

      deleteClientCookie("delete-me");

      expect(setCookieValue).toBe("delete-me=; path=/; max-age=0");

      if (originalCookie) {
        Object.defineProperty(document, "cookie", originalCookie);
      }
    });

    test("カスタム path/domain 指定で正しい cookie 文字列が設定される", () => {
      const originalCookie = Object.getOwnPropertyDescriptor(
        Document.prototype,
        "cookie",
      );
      let setCookieValue = "";
      Object.defineProperty(document, "cookie", {
        get: () => setCookieValue,
        set: (val: string) => {
          setCookieValue = val;
        },
        configurable: true,
      });

      deleteClientCookie("delete-me", {
        path: "/custom",
        domain: ".example.com",
      });

      expect(setCookieValue).toBe(
        "delete-me=; path=/custom; max-age=0; domain=.example.com",
      );

      if (originalCookie) {
        Object.defineProperty(document, "cookie", originalCookie);
      }
    });
  });
});

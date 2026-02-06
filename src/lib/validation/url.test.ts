import { validateReturnUrl } from "./url";

describe("validateReturnUrl", () => {
  describe("有効なURLを返す", () => {
    test("スラッシュで始まるパスを返す", () => {
      expect(validateReturnUrl("/dashboard")).toBe("/dashboard");
    });

    test("ルートパスを返す", () => {
      expect(validateReturnUrl("/")).toBe("/");
    });

    test("ネストされたパスを返す", () => {
      expect(validateReturnUrl("/a/b/c")).toBe("/a/b/c");
    });

    test("クエリパラメータ付きのパスを返す", () => {
      expect(validateReturnUrl("/page?foo=bar")).toBe("/page?foo=bar");
    });

    test("フラグメント付きのパスを返す", () => {
      expect(validateReturnUrl("/page#section")).toBe("/page#section");
    });

    test("クエリパラメータとフラグメント両方を含むパスを返す", () => {
      expect(validateReturnUrl("/page?foo=bar#section")).toBe(
        "/page?foo=bar#section",
      );
    });

    test("前後の空白をトリムして処理する", () => {
      expect(validateReturnUrl("  /dashboard  ")).toBe("/dashboard");
    });

    test("2048文字ちょうどのURLは有効", () => {
      const url = `/${"a".repeat(2047)}`;
      expect(validateReturnUrl(url)).toBe(url);
    });
  });

  describe("null/undefined/空文字の場合はnullを返す", () => {
    test("nullの場合", () => {
      expect(validateReturnUrl(null)).toBeNull();
    });

    test("undefinedの場合", () => {
      expect(validateReturnUrl(undefined)).toBeNull();
    });

    test("空文字の場合", () => {
      expect(validateReturnUrl("")).toBeNull();
    });
  });

  describe("絶対URLはnullを返す", () => {
    test("https://で始まるURL", () => {
      expect(validateReturnUrl("https://evil.com")).toBeNull();
    });

    test("http://で始まるURL", () => {
      expect(validateReturnUrl("http://evil.com")).toBeNull();
    });
  });

  describe("バイパス攻撃パターンはnullを返す", () => {
    test("// を含むURL", () => {
      expect(validateReturnUrl("//evil.com")).toBeNull();
    });

    test("パス内に // を含むURL", () => {
      expect(validateReturnUrl("/path//to")).toBeNull();
    });

    test("バックスラッシュを含むURL", () => {
      expect(validateReturnUrl("/path\\evil")).toBeNull();
    });

    test("\\\\で始まるURL", () => {
      expect(validateReturnUrl("\\\\evil.com")).toBeNull();
    });
  });

  describe("危険なスキームはnullを返す", () => {
    test("javascript: スキーム", () => {
      expect(validateReturnUrl("javascript:alert(1)")).toBeNull();
    });

    test("data: スキーム", () => {
      expect(validateReturnUrl("data:text/html,<h1>evil</h1>")).toBeNull();
    });

    test("vbscript: スキーム", () => {
      expect(validateReturnUrl("vbscript:MsgBox")).toBeNull();
    });

    test("file: スキーム", () => {
      expect(validateReturnUrl("file:///etc/passwd")).toBeNull();
    });
  });

  describe("特殊文字を含むURLはnullを返す", () => {
    test("ヌルバイト(%00)を含む", () => {
      expect(validateReturnUrl("/path%00evil")).toBeNull();
    });

    test("改行(\\n)を含む", () => {
      expect(validateReturnUrl("/path\nevil")).toBeNull();
    });

    test("復帰(\\r)を含む", () => {
      expect(validateReturnUrl("/path\revil")).toBeNull();
    });
  });

  describe("長さ制限", () => {
    test("2048文字を超えるURLはnullを返す", () => {
      const url = `/${"a".repeat(2048)}`;
      expect(validateReturnUrl(url)).toBeNull();
    });
  });

  describe("スラッシュで始まらない相対パスはnullを返す", () => {
    test("相対パス", () => {
      expect(validateReturnUrl("dashboard")).toBeNull();
    });

    test("ドットで始まる相対パス", () => {
      expect(validateReturnUrl("./dashboard")).toBeNull();
    });

    test("親ディレクトリ参照", () => {
      expect(validateReturnUrl("../dashboard")).toBeNull();
    });
  });
});

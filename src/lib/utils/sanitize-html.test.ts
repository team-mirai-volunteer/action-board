import { sanitizeHtml } from "./sanitize-html";

describe("sanitizeHtml", () => {
  describe("安全な整形タグの保持", () => {
    test("p / strong を保持する", () => {
      expect(sanitizeHtml("<p>詳細の<strong>内容</strong></p>")).toBe(
        "<p>詳細の<strong>内容</strong></p>",
      );
    });

    test("ul / li を保持する", () => {
      expect(sanitizeHtml("<ul><li>a</li></ul>")).toBe("<ul><li>a</li></ul>");
    });

    test("安全な href の <a> を保持する", () => {
      expect(sanitizeHtml('<a href="https://example.com">リンク</a>')).toBe(
        '<a href="https://example.com">リンク</a>',
      );
    });
  });

  describe("危険な入力の除去", () => {
    test("script タグと内容が除去される", () => {
      expect(sanitizeHtml("<p>x</p><script>alert('xss')</script>")).toBe(
        "<p>x</p>",
      );
    });

    test("javascript: スキームの href が除去される（タグ・本文は残す）", () => {
      const out = sanitizeHtml('<a href="javascript:alert(1)">リンク</a>');
      expect(out).not.toContain("javascript:");
      expect(out).toContain("リンク");
    });

    test("イベントハンドラ属性が除去される", () => {
      const out = sanitizeHtml('<img src="x" onerror="alert(1)">');
      expect(out).not.toContain("onerror");
    });
  });

  describe("エッジケース", () => {
    test("空文字列はそのまま返される", () => {
      expect(sanitizeHtml("")).toBe("");
    });

    test("プレーンテキストはそのまま返される", () => {
      expect(sanitizeHtml("プレーンテキスト")).toBe("プレーンテキスト");
    });
  });
});

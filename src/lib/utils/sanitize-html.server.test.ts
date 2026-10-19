/**
 * @jest-environment node
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { sanitizeHtml } from "./sanitize-html";

describe("sanitizeHtml server module", () => {
  test("jsdom / isomorphic-dompurify をインポートしない", () => {
    const source = readFileSync(
      path.join(__dirname, "sanitize-html.ts"),
      "utf8",
    );
    expect(source).toMatch(/from "dompurify"/);
    expect(source).not.toMatch(/from ["']isomorphic-dompurify["']/);
    expect(source).not.toMatch(/from ["']jsdom["']/);
    expect(source).not.toMatch(/require\(["']jsdom["']\)/);
  });

  test("DOM が無いときは未サニタイズの HTML を返さず例外にする", () => {
    expect(() => sanitizeHtml("<script>alert(1)</script>")).toThrow(
      /未サニタイズの HTML は返しません/,
    );
  });
});

import { isValidUrl } from "./url-validation";

describe("isValidUrl", () => {
  it("http URL を有効と判定する", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
  });

  it("https URL を有効と判定する", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
  });

  it("ftp URL を無効と判定する", () => {
    expect(isValidUrl("ftp://example.com")).toBe(false);
  });

  it("javascript: URL を無効と判定する", () => {
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
  });

  it("不正な文字列を無効と判定する", () => {
    expect(isValidUrl("not-a-url")).toBe(false);
  });

  it("空文字を無効と判定する", () => {
    expect(isValidUrl("")).toBe(false);
  });

  it("パス付きURLを有効と判定する", () => {
    expect(isValidUrl("https://example.com/path/to/page")).toBe(true);
  });

  it("クエリパラメータ付きURLを有効と判定する", () => {
    expect(isValidUrl("https://example.com?key=value&foo=bar")).toBe(true);
  });
});

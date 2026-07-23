import { isValidVenueCodeFormat } from "./venue-attribution";

describe("isValidVenueCodeFormat", () => {
  test("英数字・ハイフン・アンダースコアの1〜50文字を許可する", () => {
    expect(isValidVenueCodeFormat("sapporo-0730")).toBe(true);
    expect(isValidVenueCodeFormat("cv_sap01")).toBe(true);
    expect(isValidVenueCodeFormat("A1")).toBe(true);
    expect(isValidVenueCodeFormat("a".repeat(50))).toBe(true);
  });

  test("空文字・51文字以上・記号・日本語を拒否する", () => {
    expect(isValidVenueCodeFormat("")).toBe(false);
    expect(isValidVenueCodeFormat("a".repeat(51))).toBe(false);
    expect(isValidVenueCodeFormat("sapporo 0730")).toBe(false);
    expect(isValidVenueCodeFormat("札幌")).toBe(false);
    expect(isValidVenueCodeFormat("sap<script>")).toBe(false);
    expect(isValidVenueCodeFormat("a/b")).toBe(false);
  });
});

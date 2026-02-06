import { joinNonEmptyStrings, normalizeJoinResult } from "./batch-helpers";

describe("normalizeJoinResult", () => {
  it("単一オブジェクトの場合はそのまま返す", () => {
    const obj = { id: "1", title: "test" };
    expect(normalizeJoinResult(obj)).toBe(obj);
  });

  it("配列の場合は先頭要素を返す", () => {
    const arr = [
      { id: "1", title: "first" },
      { id: "2", title: "second" },
    ];
    expect(normalizeJoinResult(arr)).toEqual({ id: "1", title: "first" });
  });

  it("空配列の場合は null を返す", () => {
    expect(normalizeJoinResult([])).toBeNull();
  });

  it("null の場合は null を返す", () => {
    expect(normalizeJoinResult(null)).toBeNull();
  });

  it("undefined の場合は null を返す", () => {
    expect(normalizeJoinResult(undefined)).toBeNull();
  });
});

describe("joinNonEmptyStrings", () => {
  it("複数の有効な文字列をセパレータで結合する", () => {
    expect(joinNonEmptyStrings("; ", "error1", "error2")).toBe(
      "error1; error2",
    );
  });

  it("null/undefined を除外して結合する", () => {
    expect(joinNonEmptyStrings("; ", "error1", null, undefined, "error2")).toBe(
      "error1; error2",
    );
  });

  it("空文字列を除外して結合する", () => {
    expect(joinNonEmptyStrings("; ", "", "error1", "", "error2")).toBe(
      "error1; error2",
    );
  });

  it("すべてが null/undefined/空文字列の場合は undefined を返す", () => {
    expect(joinNonEmptyStrings("; ", null, undefined, "")).toBeUndefined();
  });

  it("単一の有効な値の場合はその値をそのまま返す", () => {
    expect(joinNonEmptyStrings("; ", null, "only-error", undefined)).toBe(
      "only-error",
    );
  });

  it("値が一つもない場合は undefined を返す", () => {
    expect(joinNonEmptyStrings("; ")).toBeUndefined();
  });
});

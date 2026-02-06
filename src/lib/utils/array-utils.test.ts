import { chunk } from "./array-utils";

describe("chunk", () => {
  it("should return empty array for empty input", () => {
    expect(chunk([], 3)).toEqual([]);
  });

  it("should return the whole array as a single chunk when array length is less than size", () => {
    expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
  });

  it("should split array evenly when length is divisible by size", () => {
    expect(chunk([1, 2, 3, 4, 5, 6], 3)).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });

  it("should handle remainder when length is not divisible by size", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("should return each element as its own chunk when size is 1", () => {
    expect(chunk(["a", "b", "c"], 1)).toEqual([["a"], ["b"], ["c"]]);
  });

  it("should return a single chunk when array has one element", () => {
    expect(chunk([42], 3)).toEqual([[42]]);
  });

  it("should work with generic types", () => {
    const objects = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const result = chunk(objects, 2);
    expect(result).toEqual([[{ id: 1 }, { id: 2 }], [{ id: 3 }]]);
  });
});

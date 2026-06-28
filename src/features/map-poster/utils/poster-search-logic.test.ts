import {
  POSTER_SEARCH_MAX_RESULTS,
  searchPosterBoards,
} from "./poster-search-logic";

type TestBoard = {
  id: string;
  number: string | number | null;
  name: string | null;
  address: string | null;
  city: string | null;
};

const makeBoard = (overrides: Partial<TestBoard> = {}): TestBoard => ({
  id: "id-1",
  number: "1",
  name: "中央公園",
  address: "中央区1-1",
  city: "中央区",
  ...overrides,
});

describe("searchPosterBoards", () => {
  it("returns empty array when query is shorter than the minimum length", () => {
    const boards = [makeBoard()];
    expect(searchPosterBoards(boards, "")).toEqual([]);
    expect(searchPosterBoards(boards, "中")).toEqual([]);
  });

  it("returns empty array when query is only whitespace", () => {
    expect(searchPosterBoards([makeBoard()], "   ")).toEqual([]);
  });

  it("matches by board number", () => {
    const boards = [
      makeBoard({ id: "a", number: "12" }),
      makeBoard({ id: "b", number: "34" }),
    ];
    const result = searchPosterBoards(boards, "12");
    expect(result.map((b) => b.id)).toEqual(["a"]);
  });

  it("matches a numeric number field", () => {
    const boards = [makeBoard({ id: "a", number: 105 })];
    expect(searchPosterBoards(boards, "10").map((b) => b.id)).toEqual(["a"]);
  });

  it("matches by name (partial, case-insensitive)", () => {
    const boards = [
      makeBoard({ id: "a", name: "Sakura Park" }),
      makeBoard({ id: "b", name: "中央公園" }),
    ];
    expect(searchPosterBoards(boards, "sakura").map((b) => b.id)).toEqual([
      "a",
    ]);
    expect(searchPosterBoards(boards, "公園").map((b) => b.id)).toEqual(["b"]);
  });

  it("matches by address and city", () => {
    const boards = [
      makeBoard({ id: "a", address: "港区六本木6", city: "港区" }),
      makeBoard({ id: "b", address: "渋谷区道玄坂1", city: "渋谷区" }),
    ];
    expect(searchPosterBoards(boards, "六本木").map((b) => b.id)).toEqual([
      "a",
    ]);
    expect(searchPosterBoards(boards, "渋谷").map((b) => b.id)).toEqual(["b"]);
  });

  it("matches by id", () => {
    const boards = [makeBoard({ id: "abc-123" }), makeBoard({ id: "xyz-789" })];
    expect(searchPosterBoards(boards, "xyz").map((b) => b.id)).toEqual([
      "xyz-789",
    ]);
  });

  it("treats null fields as non-matching without throwing", () => {
    const boards = [
      makeBoard({
        id: "a",
        number: null,
        name: null,
        address: null,
        city: null,
      }),
    ];
    expect(searchPosterBoards(boards, "anything")).toEqual([]);
  });

  it("returns at most POSTER_SEARCH_MAX_RESULTS results", () => {
    const boards = Array.from(
      { length: POSTER_SEARCH_MAX_RESULTS + 5 },
      (_, i) => makeBoard({ id: `id-${i}`, name: "公園" }),
    );
    expect(searchPosterBoards(boards, "公園")).toHaveLength(
      POSTER_SEARCH_MAX_RESULTS,
    );
  });

  it("returns empty array when nothing matches", () => {
    expect(searchPosterBoards([makeBoard()], "該当なし")).toEqual([]);
  });
});

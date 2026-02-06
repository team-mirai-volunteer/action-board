import { filterPosterBoards } from "./poster-filter-logic";

type TestBoard = {
  id: string;
  status: string;
};

const makeBoard = (id: string, status: string): TestBoard => ({ id, status });

describe("filterPosterBoards", () => {
  it("returns empty array for empty input", () => {
    const result = filterPosterBoards([], new Set(["done"]), false, new Set());
    expect(result).toEqual([]);
  });

  it("filters boards by status", () => {
    const boards = [
      makeBoard("1", "done"),
      makeBoard("2", "not_yet"),
      makeBoard("3", "done"),
      makeBoard("4", "reserved"),
    ];

    const result = filterPosterBoards(
      boards,
      new Set(["done"]),
      false,
      new Set(),
    );

    expect(result).toHaveLength(2);
    expect(result.map((b) => b.id)).toEqual(["1", "3"]);
  });

  it("filters by multiple statuses", () => {
    const boards = [
      makeBoard("1", "done"),
      makeBoard("2", "not_yet"),
      makeBoard("3", "reserved"),
    ];

    const result = filterPosterBoards(
      boards,
      new Set(["done", "reserved"]),
      false,
      new Set(),
    );

    expect(result).toHaveLength(2);
    expect(result.map((b) => b.id)).toEqual(["1", "3"]);
  });

  it("returns all boards when all statuses are selected", () => {
    const boards = [
      makeBoard("1", "done"),
      makeBoard("2", "not_yet"),
      makeBoard("3", "reserved"),
    ];

    const result = filterPosterBoards(
      boards,
      new Set(["done", "not_yet", "reserved"]),
      false,
      new Set(),
    );

    expect(result).toHaveLength(3);
  });

  it("returns no boards when statusSet is empty", () => {
    const boards = [makeBoard("1", "done"), makeBoard("2", "not_yet")];

    const result = filterPosterBoards(boards, new Set(), false, new Set());

    expect(result).toEqual([]);
  });

  it("filters by showOnlyMine when currentUserId is provided", () => {
    const boards = [
      makeBoard("1", "done"),
      makeBoard("2", "done"),
      makeBoard("3", "done"),
    ];

    const result = filterPosterBoards(
      boards,
      new Set(["done"]),
      true,
      new Set(["1", "3"]),
      "user-1",
    );

    expect(result).toHaveLength(2);
    expect(result.map((b) => b.id)).toEqual(["1", "3"]);
  });

  it("returns empty when showOnlyMine is true but editedBoardSet is empty", () => {
    const boards = [makeBoard("1", "done"), makeBoard("2", "done")];

    const result = filterPosterBoards(
      boards,
      new Set(["done"]),
      true,
      new Set(),
      "user-1",
    );

    expect(result).toEqual([]);
  });

  it("ignores showOnlyMine when currentUserId is not provided", () => {
    const boards = [makeBoard("1", "done"), makeBoard("2", "done")];

    const result = filterPosterBoards(
      boards,
      new Set(["done"]),
      true,
      new Set(["1"]),
    );

    expect(result).toHaveLength(2);
  });

  it("combines status filter and showOnlyMine", () => {
    const boards = [
      makeBoard("1", "done"),
      makeBoard("2", "not_yet"),
      makeBoard("3", "done"),
      makeBoard("4", "reserved"),
    ];

    const result = filterPosterBoards(
      boards,
      new Set(["done", "reserved"]),
      true,
      new Set(["1", "4"]),
      "user-1",
    );

    expect(result).toHaveLength(2);
    expect(result.map((b) => b.id)).toEqual(["1", "4"]);
  });

  it("excludes boards not in editedBoardSet even if status matches", () => {
    const boards = [makeBoard("1", "done"), makeBoard("2", "done")];

    const result = filterPosterBoards(
      boards,
      new Set(["done"]),
      true,
      new Set(["2"]),
      "user-1",
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("preserves extra properties on boards", () => {
    const boards = [
      { id: "1", status: "done", lat: 35.6, long: 139.7, name: "Tokyo" },
    ];

    const result = filterPosterBoards(
      boards,
      new Set(["done"]),
      false,
      new Set(),
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "1",
      status: "done",
      lat: 35.6,
      long: 139.7,
      name: "Tokyo",
    });
  });
});

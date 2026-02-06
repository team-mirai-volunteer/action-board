import { mapUserToHistory } from "./history-helpers";

describe("mapUserToHistory", () => {
  const userA = {
    id: "user-a",
    name: "ユーザーA",
    address_prefecture: "東京都",
  };
  const userB = {
    id: "user-b",
    name: "ユーザーB",
    address_prefecture: "大阪府",
  };

  it("履歴レコードにユーザー情報を付加する", () => {
    const history = [
      { user_id: "user-a", board_id: "board-1", status: "done" },
      { user_id: "user-b", board_id: "board-2", status: "reserved" },
    ];
    const userMap = new Map([
      ["user-a", userA],
      ["user-b", userB],
    ]);

    const result = mapUserToHistory(history, userMap);
    expect(result).toEqual([
      { user_id: "user-a", board_id: "board-1", status: "done", user: userA },
      {
        user_id: "user-b",
        board_id: "board-2",
        status: "reserved",
        user: userB,
      },
    ]);
  });

  it("userMapに存在しないユーザーの場合はuser: nullになる", () => {
    const history = [
      { user_id: "user-unknown", board_id: "board-1", status: "done" },
    ];
    const userMap = new Map([["user-a", userA]]);

    const result = mapUserToHistory(history, userMap);
    expect(result).toEqual([
      {
        user_id: "user-unknown",
        board_id: "board-1",
        status: "done",
        user: null,
      },
    ]);
  });

  it("空の履歴配列の場合は空配列を返す", () => {
    const userMap = new Map([["user-a", userA]]);
    const result = mapUserToHistory([], userMap);
    expect(result).toEqual([]);
  });

  it("空のuserMapの場合はすべてuser: nullになる", () => {
    const history = [
      { user_id: "user-a", board_id: "board-1", status: "done" },
    ];
    const userMap = new Map<
      string,
      { id: string; name: string | null; address_prefecture: string | null }
    >();

    const result = mapUserToHistory(history, userMap);
    expect(result).toEqual([
      { user_id: "user-a", board_id: "board-1", status: "done", user: null },
    ]);
  });

  it("元のレコードのプロパティを保持する", () => {
    const history = [
      {
        user_id: "user-a",
        board_id: "board-1",
        status: "done",
        created_at: "2026-01-01",
        extra_field: 42,
      },
    ];
    const userMap = new Map([["user-a", userA]]);

    const result = mapUserToHistory(history, userMap);
    expect(result[0].board_id).toBe("board-1");
    expect(result[0].created_at).toBe("2026-01-01");
    expect(result[0].extra_field).toBe(42);
    expect(result[0].user).toEqual(userA);
  });
});

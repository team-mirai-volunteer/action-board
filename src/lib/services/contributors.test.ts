import { createAdminClient } from "@/lib/supabase/adminClient";
import { getContributorNames } from "./contributors";

jest.mock("@/lib/supabase/adminClient", () => ({
  createAdminClient: jest.fn(),
}));

describe("getContributorNames", () => {
  const mockRange = jest.fn();
  const mockOrder = jest.fn(() => ({ range: mockRange }));
  const mockSelect = jest.fn(() => ({ order: mockOrder }));
  const mockFrom = jest.fn(() => ({ select: mockSelect }));

  beforeEach(() => {
    jest.clearAllMocks();
    (createAdminClient as jest.Mock).mockResolvedValue({ from: mockFrom });
  });

  it("1ページ（1000件未満）のデータをそのまま返す", async () => {
    mockRange.mockResolvedValueOnce({
      data: [{ name: "Alice" }, { name: "Bob" }],
      error: null,
    });

    const result = await getContributorNames();

    expect(result).toEqual([{ name: "Alice" }, { name: "Bob" }]);
    expect(mockFrom).toHaveBeenCalledWith("user_ranking_view");
    expect(mockSelect).toHaveBeenCalledWith("name");
    expect(mockOrder).toHaveBeenCalledWith("rank", { ascending: true });
    expect(mockRange).toHaveBeenCalledTimes(1);
    expect(mockRange).toHaveBeenCalledWith(0, 999);
  });

  it("nameがnullの行は'Unknown'に置換する", async () => {
    mockRange.mockResolvedValueOnce({
      data: [{ name: null }, { name: "Bob" }],
      error: null,
    });

    const result = await getContributorNames();

    expect(result).toEqual([{ name: "Unknown" }, { name: "Bob" }]);
  });

  it("1000件ちょうどの場合は次ページを取得する", async () => {
    const firstPage = Array.from({ length: 1000 }, (_, i) => ({
      name: `user${i}`,
    }));
    const secondPage = [{ name: "last" }];

    mockRange
      .mockResolvedValueOnce({ data: firstPage, error: null })
      .mockResolvedValueOnce({ data: secondPage, error: null });

    const result = await getContributorNames();

    expect(result).toHaveLength(1001);
    expect(result[1000]).toEqual({ name: "last" });
    expect(mockRange).toHaveBeenNthCalledWith(1, 0, 999);
    expect(mockRange).toHaveBeenNthCalledWith(2, 1000, 1999);
  });

  it("空配列が返ればループを抜ける", async () => {
    mockRange.mockResolvedValueOnce({ data: [], error: null });

    const result = await getContributorNames();

    expect(result).toEqual([]);
    expect(mockRange).toHaveBeenCalledTimes(1);
  });

  it("2ページ目が空なら1ページ目だけ返す", async () => {
    const firstPage = Array.from({ length: 1000 }, (_, i) => ({
      name: `u${i}`,
    }));
    mockRange
      .mockResolvedValueOnce({ data: firstPage, error: null })
      .mockResolvedValueOnce({ data: [], error: null });

    const result = await getContributorNames();

    expect(result).toHaveLength(1000);
    expect(mockRange).toHaveBeenCalledTimes(2);
  });

  it("エラー時は例外を投げる", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockRange.mockResolvedValueOnce({
      data: null,
      error: { message: "db error" },
    });

    await expect(getContributorNames()).rejects.toThrow(
      "貢献者一覧の取得に失敗しました",
    );
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});

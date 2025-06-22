import { getBoardPins, updatePin } from "@/lib/services/poster-map";

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(),
}));

const mockSupabaseClient = {
  from: jest.fn(),
};

const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockUpdate = jest.fn();
const mockSingle = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  const { createClient: createServerClient } = require("@/lib/supabase/server");
  const { createClient: createClientClient } = require("@/lib/supabase/client");

  createServerClient.mockResolvedValue(mockSupabaseClient);
  createClientClient.mockReturnValue(mockSupabaseClient);

  mockSupabaseClient.from.mockReturnValue({
    select: mockSelect,
    update: mockUpdate,
  });

  mockSelect.mockReturnValue({
    eq: mockEq,
  });

  mockUpdate.mockReturnValue({
    eq: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: mockSingle,
      }),
    }),
  });

  mockEq.mockResolvedValue({
    data: [],
    error: null,
  });

  mockSingle.mockResolvedValue({
    data: null,
    error: null,
  });
});

describe("ポスターマップサービス", () => {
  describe("getBoardPins関数", () => {
    const mockPinData = [
      {
        id: "1",
        place_name: "テスト掲示場1",
        address: "東京都渋谷区1-1-1",
        number: "001",
        lat: 35.6762,
        long: 139.6503,
        status: 0,
        note: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        place_name: "テスト掲示場2",
        address: "東京都新宿区2-2-2",
        number: "002",
        lat: 35.6896,
        long: 139.6917,
        status: 1,
        note: "完了済み",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      },
    ];

    describe("正常なデータ取得", () => {
      test("指定された都道府県でデータを正しく絞り込む", async () => {
        mockEq.mockResolvedValue({
          data: mockPinData.map((pin) => ({
            ...pin,
            cities: { prefecture: "東京都" },
          })),
          error: null,
        });

        const result = await getBoardPins("東京都");

        expect(mockSupabaseClient.from).toHaveBeenCalledWith("pins");
        expect(result).toHaveLength(2);
        expect(result[0].place_name).toBe("テスト掲示場1");
      });

      test("空の都道府県名でも適切に処理する", async () => {
        mockEq.mockResolvedValue({
          data: [],
          error: null,
        });

        const result = await getBoardPins("");

        expect(mockSupabaseClient.from).toHaveBeenCalledWith("pins");
        expect(mockEq).toHaveBeenCalledWith("cities.prefecture", "");
        expect(result).toEqual([]);
      });

      test("データが0件の場合でも空配列を返す", async () => {
        mockEq.mockResolvedValue({
          data: [],
          error: null,
        });

        const result = await getBoardPins("存在しない県");

        expect(result).toEqual([]);
      });
    });

    describe("エラーハンドリング", () => {
      test("データベースエラーが発生した場合に適切に処理する", async () => {
        const mockError = new Error("データベース接続エラー");
        mockEq.mockResolvedValue({
          data: null,
          error: mockError,
        });

        await expect(getBoardPins("東京都")).rejects.toThrow(
          "データベース接続エラー",
        );
      });

      test("ネットワークエラーが発生した場合にアプリがクラッシュしない", async () => {
        mockEq.mockRejectedValue(new Error("ネットワークエラー"));

        await expect(getBoardPins("東京都")).rejects.toThrow(
          "ネットワークエラー",
        );
      });

      test("無効なレスポンス形式でもエラーを適切に処理する", async () => {
        const mockError = { message: "無効なクエリ" };
        mockEq.mockResolvedValue({
          data: null,
          error: mockError,
        });

        await expect(getBoardPins("東京都")).rejects.toThrow();
      });
    });
  });

  describe("updatePin関数", () => {
    const mockUpdateRequest = {
      id: "test-pin-1",
      status: 1,
      note: "更新テスト",
    };

    describe("正常な更新処理", () => {
      test("正しいIDとデータで更新リクエストを送信する", async () => {
        mockSingle.mockResolvedValue({
          data: {
            id: 1,
            number: "001",
            address: "東京都渋谷区1-1-1",
            place_name: "テスト掲示場1",
            lat: 35.6762,
            long: 139.6503,
            status: mockUpdateRequest.status,
            note: mockUpdateRequest.note,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-02T00:00:00Z",
          },
          error: null,
        });

        const result = await updatePin(mockUpdateRequest);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith("pins");
        expect(mockUpdate).toHaveBeenCalledWith({
          status: mockUpdateRequest.status,
          note: mockUpdateRequest.note,
          updated_at: expect.any(String),
        });
        expect(result).toBeDefined();
        expect(result.id).toBe("1");
      });

      test("ステータスのみの更新でも正常に処理する", async () => {
        const statusOnlyRequest = {
          id: "test-pin-2",
          status: 2,
          note: null,
        };

        mockSingle.mockResolvedValue({
          data: {
            id: 2,
            number: "002",
            address: "東京都新宿区2-2-2",
            place_name: "テスト掲示場2",
            lat: 35.6896,
            long: 139.6917,
            status: statusOnlyRequest.status,
            note: statusOnlyRequest.note,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-02T00:00:00Z",
          },
          error: null,
        });

        const result = await updatePin(statusOnlyRequest);

        expect(mockUpdate).toHaveBeenCalledWith({
          status: statusOnlyRequest.status,
          note: statusOnlyRequest.note,
          updated_at: expect.any(String),
        });
        expect(result).toBeDefined();
      });

      test("ノートのみの更新でも正常に処理する", async () => {
        const noteOnlyRequest = {
          id: "test-pin-3",
          status: 0,
          note: "ノートのみ更新",
        };

        mockSingle.mockResolvedValue({
          data: {
            id: 3,
            number: "003",
            address: "東京都品川区3-3-3",
            place_name: "テスト掲示場3",
            lat: 35.6284,
            long: 139.7387,
            status: noteOnlyRequest.status,
            note: noteOnlyRequest.note,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-02T00:00:00Z",
          },
          error: null,
        });

        const result = await updatePin(noteOnlyRequest);

        expect(mockUpdate).toHaveBeenCalledWith({
          status: noteOnlyRequest.status,
          note: noteOnlyRequest.note,
          updated_at: expect.any(String),
        });
        expect(result).toBeDefined();
      });
    });

    describe("エラーハンドリング", () => {
      test("存在しないIDで更新しようとした場合にエラーを返す", async () => {
        const mockError = { message: "レコードが見つかりません" };
        mockSingle.mockResolvedValue({
          data: null,
          error: mockError,
        });

        await expect(updatePin(mockUpdateRequest)).rejects.toThrow();
      });

      test("データベース更新エラーが発生した場合に適切に処理する", async () => {
        const mockError = new Error("更新権限がありません");
        mockSingle.mockResolvedValue({
          data: null,
          error: mockError,
        });

        await expect(updatePin(mockUpdateRequest)).rejects.toThrow(
          "更新権限がありません",
        );
      });

      test("無効なステータス値でも処理を継続する", async () => {
        const invalidRequest = {
          id: "test-pin-4",
          status: 999,
          note: "無効なステータス",
        };

        mockSingle.mockResolvedValue({
          data: {
            id: 4,
            number: "004",
            address: "東京都港区4-4-4",
            place_name: "テスト掲示場4",
            lat: 35.6586,
            long: 139.7454,
            status: invalidRequest.status,
            note: invalidRequest.note,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-02T00:00:00Z",
          },
          error: null,
        });

        const result = await updatePin(invalidRequest);
        expect(result).toBeDefined();
      });
    });

    describe("楽観的更新の検証", () => {
      test("更新後に正しいデータが返される", async () => {
        const expectedResult = {
          id: "1",
          number: "001",
          address: "東京都渋谷区1-1-1",
          place_name: "テスト掲示場1",
          lat: 35.6762,
          long: 139.6503,
          status: mockUpdateRequest.status,
          note: mockUpdateRequest.note,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-02T12:00:00Z",
        };

        mockSingle.mockResolvedValue({
          data: {
            id: 1,
            number: "001",
            address: "東京都渋谷区1-1-1",
            place_name: "テスト掲示場1",
            lat: 35.6762,
            long: 139.6503,
            status: mockUpdateRequest.status,
            note: mockUpdateRequest.note,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-02T12:00:00Z",
          },
          error: null,
        });

        const result = await updatePin(mockUpdateRequest);

        expect(result).toEqual(expectedResult);
      });

      test("更新タイムスタンプが正しく設定される", async () => {
        mockSingle.mockResolvedValue({
          data: {
            id: 1,
            number: "001",
            address: "東京都渋谷区1-1-1",
            place_name: "テスト掲示場1",
            lat: 35.6762,
            long: 139.6503,
            status: mockUpdateRequest.status,
            note: mockUpdateRequest.note,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: expect.any(String),
          },
          error: null,
        });

        await updatePin(mockUpdateRequest);

        const updateCall = mockUpdate.mock.calls[0][0];
        expect(updateCall.updated_at).toBeDefined();
        expect(typeof updateCall.updated_at).toBe("string");
      });
    });
  });
});

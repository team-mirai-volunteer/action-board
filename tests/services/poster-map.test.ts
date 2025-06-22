// tests/services/poster-map.test.ts

import { getBoardPins, updatePin } from "@/lib/services/poster-map";
import { createClient as createClientClient } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import type { UpdatePinRequest } from "@/lib/types/poster-map";

jest.mock("@/lib/supabase/server");
jest.mock("@/lib/supabase/client");

const mockCreateClient = createClient as jest.Mock;
const mockCreateClientClient = createClientClient as jest.Mock;

describe("ポスターマップサービス", () => {
  // Supabaseクライアントのモックを定義
  let mockEq: jest.Mock;
  let mockSelect: jest.Mock;
  let mockFrom: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockSingle: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // 各メソッドのモックをセットアップ
    mockEq = jest.fn();
    mockSingle = jest.fn();
    mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
    mockUpdate = jest.fn().mockReturnValue({ eq: mockEq, single: mockSingle });
    mockFrom = jest
      .fn()
      .mockReturnValue({ select: mockSelect, update: mockUpdate });

    // サーバーサイドとクライアントサイドの両方のクライアントが同じモックを返すように設定
    mockCreateClient.mockResolvedValue({ from: mockFrom });
    mockCreateClientClient.mockReturnValue({ from: mockFrom });
  });

  describe("getBoardPins関数", () => {
    it("正常なレスポンスの場合、ピンのデータを返す", async () => {
      const mockPins = [{ id: 1, place_name: "テスト掲示場" }];
      mockSelect.mockReturnValueOnce({
        eq: mockEq.mockResolvedValue({ data: mockPins, error: null }),
      });

      const pins = await getBoardPins("東京都");
      expect(pins).toEqual(mockPins);
      expect(mockFrom).toHaveBeenCalledWith("pins");
      expect(mockEq).toHaveBeenCalledWith("cities.prefecture", "東京都");
    });

    it("DBエラー時に空配列を返す", async () => {
      mockSelect.mockReturnValueOnce({
        eq: mockEq.mockResolvedValue({
          data: null,
          error: new Error("DB Error"),
        }),
      });
      const pins = await getBoardPins("東京都");
      expect(pins).toEqual([]);
    });
  });

  describe("updatePin関数", () => {
    it("正常な更新処理で、更新後のデータを返す", async () => {
      const mockRequest: UpdatePinRequest = {
        id: 1,
        status: 1,
        note: "更新テスト",
      };
      const mockResult = { ...mockRequest, place_name: "更新された掲示場" };
      mockUpdate.mockReturnValue({
        eq: mockEq.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle.mockResolvedValue({
              data: mockResult,
              error: null,
            }),
          }),
        }),
      });

      const result = await updatePin(mockRequest);
      expect(result).toEqual(mockResult);
      expect(mockUpdate).toHaveBeenCalledWith({
        status: mockRequest.status,
        note: mockRequest.note,
      });
      expect(mockEq).toHaveBeenCalledWith("id", mockRequest.id);
    });

    it("DBエラー時にnullを返す", async () => {
      mockUpdate.mockReturnValue({
        eq: mockEq.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle.mockResolvedValue({
              data: null,
              error: new Error("Update Error"),
            }),
          }),
        }),
      });
      const result = await updatePin({ id: 1, status: 1, note: "test" });
      expect(result).toBeNull();
    });
  });
});

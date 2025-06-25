jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    order: jest.fn(),
  })),
}));

import {
  type MapShape,
  deleteShape,
  loadShapes,
  saveShape,
  updateShape,
} from "./posting";

const { createClient } = require("@/lib/supabase/client");
const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

describe("posting service", () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabaseClient = mockCreateClient();

    mockSupabaseClient.from.mockReturnThis();
    mockSupabaseClient.insert.mockReturnThis();
    mockSupabaseClient.select.mockReturnThis();
    mockSupabaseClient.delete.mockReturnThis();
    mockSupabaseClient.update.mockReturnThis();
    mockSupabaseClient.eq.mockReturnThis();

    mockSupabaseClient.single.mockResolvedValue({ data: {}, error: null });
    mockSupabaseClient.order.mockResolvedValue({ data: [], error: null });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("saveShape", () => {
    const mockShape: MapShape = {
      type: "polygon",
      coordinates: [
        [0, 0],
        [1, 1],
        [0, 1],
      ],
      properties: { color: "red" },
    };

    it("新しい図形を正常に保存する", async () => {
      const mockSavedShape = {
        id: "shape-123",
        ...mockShape,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      };

      mockSupabaseClient.insert.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockSavedShape,
          error: null,
        }),
      });

      const result = await saveShape(mockShape);

      expect(result).toEqual(mockSavedShape);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("posting_shapes");
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          type: "polygon",
          coordinates: [
            [0, 0],
            [1, 1],
            [0, 1],
          ],
          properties: { color: "red" },
          created_at: expect.any(String),
          updated_at: expect.any(String),
        }),
      ]);
    });

    it("既存のcreated_atとupdated_atを保持する", async () => {
      const mockShapeWithDates: MapShape = {
        ...mockShape,
        created_at: "2022-01-01T00:00:00Z",
        updated_at: "2022-06-01T00:00:00Z",
      };

      const mockSavedShape = {
        id: "shape-123",
        ...mockShapeWithDates,
      };

      mockSupabaseClient.insert.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockSavedShape,
          error: null,
        }),
      });

      await saveShape(mockShapeWithDates);

      expect(mockSupabaseClient.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          created_at: "2022-01-01T00:00:00Z",
          updated_at: "2022-06-01T00:00:00Z",
        }),
      ]);
    });

    it("保存エラーが発生した場合は例外を投げる", async () => {
      const mockError = { message: "保存エラー", code: "23505" };
      mockSupabaseClient.insert.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      });

      await expect(saveShape(mockShape)).rejects.toEqual(mockError);
    });
  });

  describe("deleteShape", () => {
    it("図形を正常に削除する", async () => {
      mockSupabaseClient.delete.mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      await deleteShape("shape-123");

      expect(mockSupabaseClient.from).toHaveBeenCalledWith("posting_shapes");
      expect(mockSupabaseClient.delete).toHaveBeenCalled();
    });

    it("削除エラーが発生した場合は例外を投げる", async () => {
      const mockError = { message: "削除エラー", code: "23503" };
      mockSupabaseClient.delete.mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: mockError }),
      });

      await expect(deleteShape("shape-123")).rejects.toEqual(mockError);
    });
  });

  describe("loadShapes", () => {
    it("図形一覧を正常に取得する", async () => {
      const mockShapes = [
        {
          id: "shape-1",
          type: "polygon",
          coordinates: [
            [0, 0],
            [1, 1],
            [0, 1],
          ],
          created_at: "2023-01-01T00:00:00Z",
        },
        {
          id: "shape-2",
          type: "text",
          coordinates: [0.5, 0.5],
          created_at: "2023-01-02T00:00:00Z",
        },
      ];

      mockSupabaseClient.order.mockResolvedValue({
        data: mockShapes,
        error: null,
      });

      const result = await loadShapes();

      expect(result).toEqual(mockShapes);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("posting_shapes");
      expect(mockSupabaseClient.select).toHaveBeenCalledWith("*");
      expect(mockSupabaseClient.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
    });

    it("データがnullの場合は空配列を返す", async () => {
      mockSupabaseClient.order.mockResolvedValue({ data: null, error: null });

      const result = await loadShapes();

      expect(result).toEqual([]);
    });

    it("取得エラーが発生した場合は例外を投げる", async () => {
      const mockError = { message: "取得エラー", code: "42P01" };
      mockSupabaseClient.order.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(loadShapes()).rejects.toEqual(mockError);
    });
  });

  describe("updateShape", () => {
    const mockUpdateData: Partial<MapShape> = {
      type: "text",
      coordinates: [1, 1],
      properties: { color: "blue" },
    };

    it("図形を正常に更新する", async () => {
      const mockUpdatedShape = {
        id: "shape-123",
        type: "text",
        coordinates: [1, 1],
        properties: { color: "blue" },
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T12:00:00Z",
      };

      mockSupabaseClient.update.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUpdatedShape,
              error: null,
            }),
          }),
        }),
      });

      const result = await updateShape("shape-123", mockUpdateData);

      expect(result).toEqual(mockUpdatedShape);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("posting_shapes");
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({
        type: "text",
        coordinates: [1, 1],
        properties: { color: "blue" },
        updated_at: expect.any(String),
      });
    });

    it("保護されたフィールドは更新から除外される", async () => {
      const mockUpdateDataWithProtectedFields: Partial<MapShape> = {
        id: "should-be-ignored",
        type: "text",
        created_at: "should-be-ignored",
        updated_at: "should-be-ignored",
        coordinates: [1, 1],
      };

      mockSupabaseClient.update.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: {}, error: null }),
          }),
        }),
      });

      await updateShape("shape-123", mockUpdateDataWithProtectedFields);

      expect(mockSupabaseClient.update).toHaveBeenCalledWith({
        type: "text",
        coordinates: [1, 1],
        updated_at: expect.any(String),
      });
    });

    it("更新エラーが発生した場合は例外を投げる", async () => {
      const mockError = { message: "更新エラー", code: "23505" };
      const mockUpdateError = {
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      };
      mockSupabaseClient.update.mockReturnValue(mockUpdateError);

      await expect(updateShape("shape-123", mockUpdateData)).rejects.toEqual(
        mockError,
      );
    });
  });
});

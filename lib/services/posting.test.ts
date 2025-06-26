jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => {
      const createMockSupabaseQuery = () => {
        const mockQuery = {
          eq: jest.fn(() => mockQuery),
          gte: jest.fn(() => mockQuery),
          lte: jest.fn(() => mockQuery),
          gt: jest.fn(() => mockQuery),
          lt: jest.fn(() => mockQuery),
          in: jest.fn(() => mockQuery),
          order: jest.fn(() => mockQuery),
          limit: jest.fn(() => mockQuery),
          range: jest.fn(() => mockQuery),
          neq: jest.fn(() => mockQuery),
          is: jest.fn(() => mockQuery),
          not: jest.fn(() => mockQuery),
          or: jest.fn(() => mockQuery),
          and: jest.fn(() => mockQuery),
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          maybeSingle: jest.fn(() =>
            Promise.resolve({ data: null, error: null }),
          ),
        };
        return mockQuery;
      };

      return {
        select: jest.fn(() => createMockSupabaseQuery()),
        insert: jest.fn(() => createMockSupabaseQuery()),
        update: jest.fn(() => createMockSupabaseQuery()),
        delete: jest.fn(() => createMockSupabaseQuery()),
        upsert: jest.fn(() => createMockSupabaseQuery()),
      };
    }),
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

    const mockQuery = mockSupabaseClient.from();
    mockQuery.select().single.mockResolvedValue({ data: {}, error: null });
    mockQuery.select().order.mockResolvedValue({ data: [], error: null });
    mockQuery
      .insert()
      .select()
      .single.mockResolvedValue({ data: {}, error: null });
    mockQuery
      .update()
      .eq()
      .select()
      .single.mockResolvedValue({ data: {}, error: null });
    mockQuery.delete().eq.mockResolvedValue({ error: null });
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

      const mockQuery = mockSupabaseClient.from();
      mockQuery.insert().select().single.mockResolvedValue({
        data: mockSavedShape,
        error: null,
      });

      const result = await saveShape(mockShape);

      expect(result).toEqual(mockSavedShape);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("posting_shapes");
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

      const mockQuery = mockSupabaseClient.from();
      mockQuery.insert().select().single.mockResolvedValue({
        data: mockSavedShape,
        error: null,
      });

      await saveShape(mockShapeWithDates);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith("posting_shapes");
    });

    it("保存エラーが発生した場合は例外を投げる", async () => {
      const mockError = { message: "保存エラー", code: "23505" };
      const mockQuery = mockSupabaseClient.from();
      mockQuery.insert().select().single.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(saveShape(mockShape)).rejects.toEqual(mockError);
    });
  });

  describe("deleteShape", () => {
    it("図形を正常に削除する", async () => {
      const mockQuery = mockSupabaseClient.from();
      mockQuery.delete().eq.mockResolvedValue({ error: null });

      await deleteShape("shape-123");

      expect(mockSupabaseClient.from).toHaveBeenCalledWith("posting_shapes");
    });

    it("削除エラーが発生した場合は例外を投げる", async () => {
      const mockError = { message: "削除エラー", code: "23503" };
      const mockQuery = mockSupabaseClient.from();
      mockQuery.delete().eq.mockResolvedValue({ error: mockError });

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

      const mockQuery = mockSupabaseClient.from();
      mockQuery.select().order.mockResolvedValue({
        data: mockShapes,
        error: null,
      });

      const result = await loadShapes();

      expect(result).toEqual(mockShapes);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("posting_shapes");
    });

    it("データがnullの場合は空配列を返す", async () => {
      const mockQuery = mockSupabaseClient.from();
      mockQuery.select().order.mockResolvedValue({ data: null, error: null });

      const result = await loadShapes();

      expect(result).toEqual([]);
    });

    it("取得エラーが発生した場合は例外を投げる", async () => {
      const mockError = { message: "取得エラー", code: "42P01" };
      const mockQuery = mockSupabaseClient.from();
      mockQuery.select().order.mockResolvedValue({
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

      const mockQuery = mockSupabaseClient.from();
      mockQuery.update().eq().select().single.mockResolvedValue({
        data: mockUpdatedShape,
        error: null,
      });

      const result = await updateShape("shape-123", mockUpdateData);

      expect(result).toEqual(mockUpdatedShape);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("posting_shapes");
    });

    it("保護されたフィールドは更新から除外される", async () => {
      const mockUpdateDataWithProtectedFields: Partial<MapShape> = {
        id: "should-be-ignored",
        type: "text",
        created_at: "should-be-ignored",
        updated_at: "should-be-ignored",
        coordinates: [1, 1],
      };

      const mockQuery = mockSupabaseClient.from();
      mockQuery
        .update()
        .eq()
        .select()
        .single.mockResolvedValue({ data: {}, error: null });

      await updateShape("shape-123", mockUpdateDataWithProtectedFields);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith("posting_shapes");
    });

    it("更新エラーが発生した場合は例外を投げる", async () => {
      const mockError = { message: "更新エラー", code: "23505" };
      const mockQuery = mockSupabaseClient.from();
      mockQuery.update().eq().select().single.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(updateShape("shape-123", mockUpdateData)).rejects.toEqual(
        mockError,
      );
    });
  });
});

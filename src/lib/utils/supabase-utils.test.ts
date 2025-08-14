import {
  chunkArray,
  executeChunkedInsert,
  executeChunkedQuery,
} from "./supabase-utils";

describe("supabase-utils", () => {
  describe("chunkArray", () => {
    it("should split array into chunks of specified size", () => {
      const array = [1, 2, 3, 4, 5];
      const result = chunkArray(array, 2);
      expect(result).toEqual([[1, 2], [3, 4], [5]]);
    });

    it("should handle empty array", () => {
      const result = chunkArray([], 2);
      expect(result).toEqual([]);
    });

    it("should handle array smaller than chunk size", () => {
      const array = [1, 2];
      const result = chunkArray(array, 5);
      expect(result).toEqual([[1, 2]]);
    });

    it("should handle chunk size of 1", () => {
      const array = [1, 2, 3];
      const result = chunkArray(array, 1);
      expect(result).toEqual([[1], [2], [3]]);
    });

    it("should handle array that divides evenly", () => {
      const array = [1, 2, 3, 4];
      const result = chunkArray(array, 2);
      expect(result).toEqual([
        [1, 2],
        [3, 4],
      ]);
    });
  });

  describe("executeChunkedQuery", () => {
    beforeEach(() => {
      jest.spyOn(console, "log").mockImplementation(() => {});
      jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should return empty array for empty ids", async () => {
      const mockQueryFn = jest.fn();
      const result = await executeChunkedQuery([], mockQueryFn);
      expect(result).toEqual({ data: [], error: null });
      expect(mockQueryFn).not.toHaveBeenCalled();
    });

    it("should execute query function for each chunk", async () => {
      const mockQueryFn = jest
        .fn()
        .mockResolvedValue({ data: ["result1"], error: null });
      const ids = ["1", "2", "3"];
      const result = await executeChunkedQuery(ids, mockQueryFn, 2);
      expect(mockQueryFn).toHaveBeenCalledTimes(2);
      expect(mockQueryFn).toHaveBeenCalledWith(["1", "2"]);
      expect(mockQueryFn).toHaveBeenCalledWith(["3"]);
      expect(result.data).toEqual(["result1", "result1"]);
      expect(result.error).toBeNull();
    });

    it("should handle query errors", async () => {
      const mockQueryFn = jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Test error" },
      });
      const result = await executeChunkedQuery(["1"], mockQueryFn);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe("Test error");
      expect(result.data).toBeNull();
    });

    it("should use default chunk size of 50", async () => {
      const mockQueryFn = jest
        .fn()
        .mockResolvedValue({ data: ["result"], error: null });
      const ids = Array.from({ length: 100 }, (_, i) => i.toString());
      await executeChunkedQuery(ids, mockQueryFn);
      expect(mockQueryFn).toHaveBeenCalledTimes(2);
    });

    it("should handle null data from query function", async () => {
      const mockQueryFn = jest
        .fn()
        .mockResolvedValue({ data: null, error: null });
      const result = await executeChunkedQuery(["1"], mockQueryFn);
      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it("should log progress for large number of chunks", async () => {
      const mockQueryFn = jest
        .fn()
        .mockResolvedValue({ data: ["result"], error: null });
      const ids = Array.from({ length: 550 }, (_, i) => i.toString());
      await executeChunkedQuery(ids, mockQueryFn, 50);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("進捗: 10/11 チャンク完了"),
      );
    });
  });

  describe("executeChunkedInsert", () => {
    beforeEach(() => {
      jest.spyOn(console, "log").mockImplementation(() => {});
      jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should return empty array for empty records", async () => {
      const mockInsertFn = jest.fn();
      const result = await executeChunkedInsert([], mockInsertFn);
      expect(result).toEqual({ data: [], error: null });
      expect(mockInsertFn).not.toHaveBeenCalled();
    });

    it("should execute insert function for each chunk", async () => {
      const mockInsertFn = jest
        .fn()
        .mockResolvedValue({ data: ["inserted1"], error: null });
      const records = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = await executeChunkedInsert(records, mockInsertFn, 2);
      expect(mockInsertFn).toHaveBeenCalledTimes(2);
      expect(mockInsertFn).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
      expect(mockInsertFn).toHaveBeenCalledWith([{ id: 3 }]);
      expect(result.data).toEqual(["inserted1", "inserted1"]);
      expect(result.error).toBeNull();
    });

    it("should handle insert errors", async () => {
      const mockInsertFn = jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Insert error" },
      });
      const result = await executeChunkedInsert([{ id: 1 }], mockInsertFn);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe("Insert error");
      expect(result.data).toBeNull();
    });

    it("should use default chunk size of 50", async () => {
      const mockInsertFn = jest
        .fn()
        .mockResolvedValue({ data: ["result"], error: null });
      const records = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      await executeChunkedInsert(records, mockInsertFn);
      expect(mockInsertFn).toHaveBeenCalledTimes(2);
    });

    it("should handle null data from insert function", async () => {
      const mockInsertFn = jest
        .fn()
        .mockResolvedValue({ data: null, error: null });
      const result = await executeChunkedInsert([{ id: 1 }], mockInsertFn);
      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });

    it("should return null when no results", async () => {
      const mockInsertFn = jest
        .fn()
        .mockResolvedValue({ data: [], error: null });
      const result = await executeChunkedInsert([{ id: 1 }], mockInsertFn);
      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });

    it("should log progress for large number of chunks", async () => {
      const mockInsertFn = jest
        .fn()
        .mockResolvedValue({ data: ["result"], error: null });
      const records = Array.from({ length: 550 }, (_, i) => ({ id: i }));
      await executeChunkedInsert(records, mockInsertFn, 50);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("進捗: 10/11 チャンク挿入完了"),
      );
    });
  });
});

import { formatUserDisplayName, formatUserPrefecture } from "./ranking-utils";

describe("ranking-utils", () => {
  describe("formatUserDisplayName", () => {
    it("should return the name when provided", () => {
      expect(formatUserDisplayName("田中太郎")).toBe("田中太郎");
    });

    it("should return the name when provided with empty string", () => {
      expect(formatUserDisplayName("")).toBe("名前未設定");
    });

    it("should return default text when name is null", () => {
      expect(formatUserDisplayName(null)).toBe("名前未設定");
    });

    it("should handle special characters in name", () => {
      expect(formatUserDisplayName("山田 花子-123")).toBe("山田 花子-123");
    });
  });

  describe("formatUserPrefecture", () => {
    it("should return the prefecture when provided", () => {
      expect(formatUserPrefecture("東京都")).toBe("東京都");
    });

    it("should return the prefecture when provided with empty string", () => {
      expect(formatUserPrefecture("")).toBe("未設定");
    });

    it("should return default text when prefecture is null", () => {
      expect(formatUserPrefecture(null)).toBe("未設定");
    });

    it("should handle various prefecture formats", () => {
      expect(formatUserPrefecture("北海道")).toBe("北海道");
      expect(formatUserPrefecture("大阪府")).toBe("大阪府");
      expect(formatUserPrefecture("神奈川県")).toBe("神奈川県");
    });
  });
});

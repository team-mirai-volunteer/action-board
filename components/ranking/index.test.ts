import * as RankingExports from "./index";

describe("ranking/index", () => {
  describe("エクスポートの確認", () => {
    it("RankingTopがエクスポートされている", () => {
      expect(RankingExports.RankingTop).toBeDefined();
      expect(typeof RankingExports.RankingTop).toBe("function");
    });

    it("RankingItemがエクスポートされている", () => {
      expect(RankingExports.RankingItem).toBeDefined();
      expect(typeof RankingExports.RankingItem).toBe("object");
    });
  });

  describe("エクスポート数の確認", () => {
    it("期待される数のエクスポートがある", () => {
      const exportKeys = Object.keys(RankingExports);
      expect(exportKeys).toHaveLength(2);
      expect(exportKeys).toContain("RankingTop");
      expect(exportKeys).toContain("RankingItem");
    });
  });
});

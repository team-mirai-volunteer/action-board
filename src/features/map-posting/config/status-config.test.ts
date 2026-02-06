import {
  CLUSTER_THRESHOLD_ZOOM,
  getClusterThresholdForArea,
} from "./status-config";

describe("getClusterThresholdForArea", () => {
  describe("デフォルト値を返すケース", () => {
    test("nullの場合、デフォルト値(13)を返す", () => {
      expect(getClusterThresholdForArea(null)).toBe(CLUSTER_THRESHOLD_ZOOM);
      expect(getClusterThresholdForArea(null)).toBe(13);
    });

    test("0の場合、falsyなのでデフォルト値(13)を返す", () => {
      expect(getClusterThresholdForArea(0)).toBe(CLUSTER_THRESHOLD_ZOOM);
      expect(getClusterThresholdForArea(0)).toBe(13);
    });

    test("1km²未満(999,999m²)の場合、デフォルト値(13)を返す", () => {
      expect(getClusterThresholdForArea(999_999)).toBe(CLUSTER_THRESHOLD_ZOOM);
      expect(getClusterThresholdForArea(999_999)).toBe(13);
    });
  });

  describe("1km²以上 10km²未満の場合、ズーム12を返す", () => {
    test("ちょうど1km²(1,000,000m²)の場合、12を返す", () => {
      expect(getClusterThresholdForArea(1_000_000)).toBe(12);
    });

    test("1km²〜10km²の間(5,000,000m²)の場合、12を返す", () => {
      expect(getClusterThresholdForArea(5_000_000)).toBe(12);
    });
  });

  describe("10km²以上 100km²未満の場合、ズーム10を返す", () => {
    test("ちょうど10km²(10,000,000m²)の場合、10を返す", () => {
      expect(getClusterThresholdForArea(10_000_000)).toBe(10);
    });

    test("10km²〜100km²の間(50,000,000m²)の場合、10を返す", () => {
      expect(getClusterThresholdForArea(50_000_000)).toBe(10);
    });
  });

  describe("100km²以上の場合、ズーム8を返す", () => {
    test("ちょうど100km²(100,000,000m²)の場合、8を返す", () => {
      expect(getClusterThresholdForArea(100_000_000)).toBe(8);
    });

    test("100km²超(500,000,000m²)の場合、8を返す", () => {
      expect(getClusterThresholdForArea(500_000_000)).toBe(8);
    });
  });
});

import type { Json } from "@/lib/types/supabase";
import {
  calculatePolygonArea,
  calculatePolygonCentroid,
} from "./polygon-utils";

// 東京タワー付近の小さな三角形（閉じたリング: 最初と最後の点が同じ）
const triangle = {
  type: "Polygon",
  coordinates: [
    [
      [139.745, 35.658],
      [139.746, 35.659],
      [139.747, 35.658],
      [139.745, 35.658],
    ],
  ],
};

// 四角形（閉じたリング）
const rectangle = {
  type: "Polygon",
  coordinates: [
    [
      [139.74, 35.65],
      [139.75, 35.65],
      [139.75, 35.66],
      [139.74, 35.66],
      [139.74, 35.65],
    ],
  ],
};

// 閉じていないリング（最初と最後の点が異なる）
const openRing = {
  type: "Polygon",
  coordinates: [
    [
      [139.745, 35.658],
      [139.746, 35.659],
      [139.747, 35.658],
    ],
  ],
};

describe("polygon-utils", () => {
  describe("calculatePolygonCentroid", () => {
    test("三角形ポリゴン（閉じたリング）の重心を正しく計算する", () => {
      const result = calculatePolygonCentroid(triangle as unknown as Json);
      expect(result).not.toBeNull();
      // 閉じたリングなので最後の点を除外して3点の平均
      // lng: (139.745 + 139.746 + 139.747) / 3 = 139.746
      // lat: (35.658 + 35.659 + 35.658) / 3 = 35.658333...
      expect(result?.lng).toBeCloseTo(139.746, 5);
      expect(result?.lat).toBeCloseTo(35.658333, 4);
    });

    test("四角形ポリゴンの重心を正しく計算する", () => {
      const result = calculatePolygonCentroid(rectangle as unknown as Json);
      expect(result).not.toBeNull();
      // 閉じたリングなので最後の点を除外して4点の平均
      // lng: (139.74 + 139.75 + 139.75 + 139.74) / 4 = 139.745
      // lat: (35.65 + 35.65 + 35.66 + 35.66) / 4 = 35.655
      expect(result?.lng).toBeCloseTo(139.745, 5);
      expect(result?.lat).toBeCloseTo(35.655, 5);
    });

    test("閉じたリング（最初と最後の点が同じ）で最後の点を除外する", () => {
      // 閉じたリングの三角形: 4点中3点を使用
      const closedResult = calculatePolygonCentroid(
        triangle as unknown as Json,
      );

      // 閉じていないリング: 3点全てを使用
      const openResult = calculatePolygonCentroid(openRing as unknown as Json);

      // 両方とも同じ3点を使っているので結果は同じ
      expect(closedResult).not.toBeNull();
      expect(openResult).not.toBeNull();
      expect(closedResult?.lat).toBeCloseTo(openResult!.lat, 10);
      expect(closedResult?.lng).toBeCloseTo(openResult!.lng, 10);
    });

    test("閉じていないリングの場合は全点を使う", () => {
      const result = calculatePolygonCentroid(openRing as unknown as Json);
      expect(result).not.toBeNull();
      // 3点全ての平均
      expect(result?.lng).toBeCloseTo((139.745 + 139.746 + 139.747) / 3, 10);
      expect(result?.lat).toBeCloseTo((35.658 + 35.659 + 35.658) / 3, 10);
    });

    test("type が 'Polygon' でない場合は null を返す", () => {
      const point = { type: "Point", coordinates: [139.745, 35.658] };
      expect(calculatePolygonCentroid(point as unknown as Json)).toBeNull();
    });

    test("coordinates が null の場合は null を返す", () => {
      const noCoords = { type: "Polygon", coordinates: null };
      expect(calculatePolygonCentroid(noCoords as unknown as Json)).toBeNull();
    });

    test("coordinates が undefined の場合は null を返す", () => {
      const noCoords = { type: "Polygon" };
      expect(calculatePolygonCentroid(noCoords as unknown as Json)).toBeNull();
    });

    test("coordinates[0] が空の場合は null を返す", () => {
      const emptyCoords = { type: "Polygon", coordinates: [[]] };
      expect(
        calculatePolygonCentroid(emptyCoords as unknown as Json),
      ).toBeNull();
    });

    test("不正なデータでエラーにならず null を返す", () => {
      expect(calculatePolygonCentroid(null as unknown as Json)).toBeNull();
      expect(calculatePolygonCentroid(undefined as unknown as Json)).toBeNull();
      expect(calculatePolygonCentroid("invalid" as unknown as Json)).toBeNull();
      expect(calculatePolygonCentroid(123 as unknown as Json)).toBeNull();
    });

    test("1点のみのリングの場合も正しく計算する", () => {
      const singlePoint = {
        type: "Polygon",
        coordinates: [[[139.745, 35.658]]],
      };
      const result = calculatePolygonCentroid(singlePoint as unknown as Json);
      expect(result).not.toBeNull();
      expect(result?.lng).toBeCloseTo(139.745, 10);
      expect(result?.lat).toBeCloseTo(35.658, 10);
    });
  });

  describe("calculatePolygonArea", () => {
    test("既知のポリゴンの面積が妥当な範囲にある", () => {
      // 四角形: 約0.01度 x 約0.01度（東京付近）
      // 緯度35度付近では 0.01度 ≈ 約910m(lng) x 約1110m(lat)
      // 面積 ≈ 約910 * 1110 ≈ 約1,010,000 m²
      const result = calculatePolygonArea(rectangle as unknown as Json);
      expect(result).not.toBeNull();
      expect(result).toBeGreaterThan(0);
      // 妥当な範囲チェック（500,000〜1,500,000 m²）
      expect(result).toBeGreaterThan(500_000);
      expect(result).toBeLessThan(1_500_000);
    });

    test("三角形ポリゴンの面積が正の数で返される", () => {
      const result = calculatePolygonArea(triangle as unknown as Json);
      expect(result).not.toBeNull();
      expect(result).toBeGreaterThan(0);
    });

    test("結果が平方メートルで返される（正の数）", () => {
      const result = calculatePolygonArea(rectangle as unknown as Json);
      expect(result).not.toBeNull();
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThan(0);
    });

    test("type が 'Polygon' でない場合は null を返す", () => {
      const line = {
        type: "LineString",
        coordinates: [
          [139.745, 35.658],
          [139.746, 35.659],
        ],
      };
      expect(calculatePolygonArea(line as unknown as Json)).toBeNull();
    });

    test("coordinates が null の場合は null を返す", () => {
      const noCoords = { type: "Polygon", coordinates: null };
      expect(calculatePolygonArea(noCoords as unknown as Json)).toBeNull();
    });

    test("coordinates が undefined の場合は null を返す", () => {
      const noCoords = { type: "Polygon" };
      expect(calculatePolygonArea(noCoords as unknown as Json)).toBeNull();
    });

    test("不正なデータでエラーにならず null を返す", () => {
      expect(calculatePolygonArea(null as unknown as Json)).toBeNull();
      expect(calculatePolygonArea(undefined as unknown as Json)).toBeNull();
      expect(calculatePolygonArea("invalid" as unknown as Json)).toBeNull();
    });
  });
});

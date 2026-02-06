import type { Layer } from "leaflet";
import { postingStatusConfig } from "../config/status-config";
import {
  applyStatusStyle,
  getShapeId,
  propagateShapeId,
} from "./shape-layer-utils";

// Leaflet Layer をプレーンオブジェクトでモック
function createMockLayer(
  overrides: Record<string, unknown> = {},
): Layer & Record<string, unknown> {
  return {
    options: {},
    ...overrides,
  } as Layer & Record<string, unknown>;
}

describe("shape-layer-utils", () => {
  describe("getShapeId", () => {
    test("layer._shapeId がある場合、その値を返す", () => {
      const layer = createMockLayer({ _shapeId: "id-from-shapeId" });
      expect(getShapeId(layer as Layer)).toBe("id-from-shapeId");
    });

    test("layer._shapeId なし、layer.options.shapeId ありの場合、options.shapeId を返す", () => {
      const layer = createMockLayer({
        options: { shapeId: "id-from-options" },
      });
      expect(getShapeId(layer as Layer)).toBe("id-from-options");
    });

    test("layer._shapeId なし、options.shapeId なし、feature.properties._shapeId ありの場合、その値を返す", () => {
      const layer = createMockLayer({
        feature: { properties: { _shapeId: "id-from-feature" } },
      });
      expect(getShapeId(layer as Layer)).toBe("id-from-feature");
    });

    test("全てなしの場合、undefined を返す", () => {
      const layer = createMockLayer();
      expect(getShapeId(layer as Layer)).toBeUndefined();
    });

    test("_shapeId が優先される（複数箇所に異なるIDがある場合）", () => {
      const layer = createMockLayer({
        _shapeId: "priority-id",
        options: { shapeId: "options-id" },
        feature: { properties: { _shapeId: "feature-id" } },
      });
      expect(getShapeId(layer as Layer)).toBe("priority-id");
    });
  });

  describe("propagateShapeId", () => {
    test("単一レイヤーに _shapeId, options.shapeId, feature.properties._shapeId の3箇所に設定する", () => {
      const layer = createMockLayer({
        options: {},
        feature: { properties: {} },
      });

      propagateShapeId(layer as Layer, "new-id");

      expect(layer._shapeId).toBe("new-id");
      expect((layer.options as Record<string, unknown>).shapeId).toBe("new-id");
      expect(
        (layer.feature as { properties: Record<string, unknown> }).properties
          ._shapeId,
      ).toBe("new-id");
    });

    test("子レイヤー持ち（getLayers()あり）の場合、再帰的に全子レイヤーにも設定する", () => {
      const child1 = createMockLayer({
        options: {},
        feature: { properties: {} },
      });
      const child2 = createMockLayer({
        options: {},
        feature: { properties: {} },
      });
      const parent = createMockLayer({
        options: {},
        feature: { properties: {} },
        getLayers: () => [child1, child2],
      });

      propagateShapeId(parent as Layer, "parent-id");

      expect(parent._shapeId).toBe("parent-id");
      expect(child1._shapeId).toBe("parent-id");
      expect(child2._shapeId).toBe("parent-id");
      expect((child1.options as Record<string, unknown>).shapeId).toBe(
        "parent-id",
      );
      expect((child2.options as Record<string, unknown>).shapeId).toBe(
        "parent-id",
      );
    });

    test("layer.feature がない場合、feature.properties への設定をスキップする", () => {
      const layer = createMockLayer({ options: {} });

      propagateShapeId(layer as Layer, "test-id");

      expect(layer._shapeId).toBe("test-id");
      expect((layer.options as Record<string, unknown>).shapeId).toBe(
        "test-id",
      );
      // feature がないのでエラーにならないことを確認
      expect(layer.feature).toBeUndefined();
    });

    test("null/falsy layer の場合、早期リターンする", () => {
      // null を渡してもエラーにならないことを確認
      expect(() =>
        propagateShapeId(null as unknown as Layer, "test-id"),
      ).not.toThrow();
      expect(() =>
        propagateShapeId(undefined as unknown as Layer, "test-id"),
      ).not.toThrow();
    });
  });

  describe("applyStatusStyle", () => {
    test("setStyle メソッド持ちレイヤーに対して setStyle が正しい引数で呼ばれる", () => {
      const setStyleMock = jest.fn();
      const layer = createMockLayer({ setStyle: setStyleMock });

      applyStatusStyle(layer as Layer, "planned");

      const expectedStyle = {
        color: postingStatusConfig.planned.color,
        fillColor: postingStatusConfig.planned.fillColor,
        fillOpacity: postingStatusConfig.planned.fillOpacity,
      };
      expect(setStyleMock).toHaveBeenCalledWith(expectedStyle);
    });

    test("eachLayer メソッド持ちレイヤー（LayerGroup）の場合、各サブレイヤーの setStyle が呼ばれる", () => {
      const subSetStyle1 = jest.fn();
      const subSetStyle2 = jest.fn();
      const subLayer1 = createMockLayer({ setStyle: subSetStyle1 });
      const subLayer2 = createMockLayer({ setStyle: subSetStyle2 });

      const layer = createMockLayer({
        eachLayer: (fn: (l: Layer) => void) => {
          fn(subLayer1 as Layer);
          fn(subLayer2 as Layer);
        },
      });

      applyStatusStyle(layer as Layer, "completed");

      const expectedStyle = {
        color: postingStatusConfig.completed.color,
        fillColor: postingStatusConfig.completed.fillColor,
        fillOpacity: postingStatusConfig.completed.fillOpacity,
      };
      expect(subSetStyle1).toHaveBeenCalledWith(expectedStyle);
      expect(subSetStyle2).toHaveBeenCalledWith(expectedStyle);
    });

    test("setStyle も eachLayer もない場合、エラーなく完了する", () => {
      const layer = createMockLayer();
      expect(() => applyStatusStyle(layer as Layer, "planned")).not.toThrow();
    });

    test("ステータスを指定しない場合、デフォルトの planned スタイルが適用される", () => {
      const setStyleMock = jest.fn();
      const layer = createMockLayer({ setStyle: setStyleMock });

      applyStatusStyle(layer as Layer);

      const expectedStyle = {
        color: postingStatusConfig.planned.color,
        fillColor: postingStatusConfig.planned.fillColor,
        fillOpacity: postingStatusConfig.planned.fillOpacity,
      };
      expect(setStyleMock).toHaveBeenCalledWith(expectedStyle);
    });

    test("各ステータスに対して正しいスタイルが適用される", () => {
      const statuses = [
        "planned",
        "completed",
        "unavailable",
        "other",
      ] as const;

      for (const status of statuses) {
        const setStyleMock = jest.fn();
        const layer = createMockLayer({ setStyle: setStyleMock });

        applyStatusStyle(layer as Layer, status);

        const config = postingStatusConfig[status];
        expect(setStyleMock).toHaveBeenCalledWith({
          color: config.color,
          fillColor: config.fillColor,
          fillOpacity: config.fillOpacity,
        });
      }
    });
  });
});

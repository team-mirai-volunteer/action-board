import type { MarkerWithShape } from "../types/posting-types";
import { countStatusesFromMarkers } from "./cluster-icon";

// テスト用ヘルパー: MarkerWithShapeモックを作成
function createMarker(
  shapeData?: MarkerWithShape["shapeData"],
): MarkerWithShape {
  return {
    marker: {} as MarkerWithShape,
    shapeData,
  } as unknown as MarkerWithShape;
}

describe("countStatusesFromMarkers", () => {
  describe("空配列", () => {
    test("空配列の場合、全ステータス0かつtotalPostingCount=0を返す", () => {
      const result = countStatusesFromMarkers([]);
      expect(result.statusCounts).toEqual({
        planned: 0,
        completed: 0,
        unavailable: 0,
        other: 0,
      });
      expect(result.totalPostingCount).toBe(0);
    });
  });

  describe("単一ステータスのマーカー", () => {
    test("planned状態のマーカーのみ → planned=N、他=0", () => {
      const markers = [
        createMarker({
          id: "1",
          status: "planned",
          lat: 35.0,
          lng: 139.0,
        }),
        createMarker({
          id: "2",
          status: "planned",
          lat: 35.1,
          lng: 139.1,
        }),
        createMarker({
          id: "3",
          status: "planned",
          lat: 35.2,
          lng: 139.2,
        }),
      ];
      const result = countStatusesFromMarkers(markers);
      expect(result.statusCounts.planned).toBe(3);
      expect(result.statusCounts.completed).toBe(0);
      expect(result.statusCounts.unavailable).toBe(0);
      expect(result.statusCounts.other).toBe(0);
      expect(result.totalPostingCount).toBe(0);
    });

    test("completed状態のマーカー(posting_count付き) → completedカウントとtotalPostingCount合算", () => {
      const markers = [
        createMarker({
          id: "1",
          status: "completed",
          posting_count: 5,
          lat: 35.0,
          lng: 139.0,
        }),
        createMarker({
          id: "2",
          status: "completed",
          posting_count: 10,
          lat: 35.1,
          lng: 139.1,
        }),
      ];
      const result = countStatusesFromMarkers(markers);
      expect(result.statusCounts.completed).toBe(2);
      expect(result.totalPostingCount).toBe(15);
    });
  });

  describe("全ステータス混在", () => {
    test("各ステータスが正しくカウントされる", () => {
      const markers = [
        createMarker({
          id: "1",
          status: "planned",
          lat: 35.0,
          lng: 139.0,
        }),
        createMarker({
          id: "2",
          status: "completed",
          posting_count: 5,
          lat: 35.1,
          lng: 139.1,
        }),
        createMarker({
          id: "3",
          status: "unavailable",
          lat: 35.2,
          lng: 139.2,
        }),
        createMarker({
          id: "4",
          status: "other",
          lat: 35.3,
          lng: 139.3,
        }),
        createMarker({
          id: "5",
          status: "completed",
          posting_count: 3,
          lat: 35.4,
          lng: 139.4,
        }),
      ];
      const result = countStatusesFromMarkers(markers);
      expect(result.statusCounts).toEqual({
        planned: 1,
        completed: 2,
        unavailable: 1,
        other: 1,
      });
      expect(result.totalPostingCount).toBe(8);
    });
  });

  describe("shapeDataがnull/undefinedのマーカー", () => {
    test("shapeDataがundefinedのマーカーはカウントされない", () => {
      const markers = [
        createMarker(undefined),
        createMarker({
          id: "1",
          status: "planned",
          lat: 35.0,
          lng: 139.0,
        }),
      ];
      const result = countStatusesFromMarkers(markers);
      expect(result.statusCounts.planned).toBe(1);
      expect(result.statusCounts.completed).toBe(0);
      expect(result.statusCounts.unavailable).toBe(0);
      expect(result.statusCounts.other).toBe(0);
      expect(result.totalPostingCount).toBe(0);
    });
  });

  describe("posting_countが0やnullのマーカー", () => {
    test("posting_countが0のマーカーはtotalPostingCountに加算されない", () => {
      const markers = [
        createMarker({
          id: "1",
          status: "completed",
          posting_count: 0,
          lat: 35.0,
          lng: 139.0,
        }),
        createMarker({
          id: "2",
          status: "completed",
          posting_count: 5,
          lat: 35.1,
          lng: 139.1,
        }),
      ];
      const result = countStatusesFromMarkers(markers);
      expect(result.statusCounts.completed).toBe(2);
      expect(result.totalPostingCount).toBe(5);
    });

    test("posting_countがnullのマーカーはtotalPostingCountに加算されない", () => {
      const markers = [
        createMarker({
          id: "1",
          status: "completed",
          posting_count: null,
          lat: 35.0,
          lng: 139.0,
        }),
        createMarker({
          id: "2",
          status: "completed",
          posting_count: 7,
          lat: 35.1,
          lng: 139.1,
        }),
      ];
      const result = countStatusesFromMarkers(markers);
      expect(result.statusCounts.completed).toBe(2);
      expect(result.totalPostingCount).toBe(7);
    });
  });
});

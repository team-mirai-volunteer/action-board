import { createCityStatsMarkerIcon } from "./city-stats-marker";

// Leaflet の L.divIcon モック
const mockDivIcon = jest.fn();
const mockL = { divIcon: mockDivIcon };

beforeEach(() => {
  mockDivIcon.mockClear();
});

describe("createCityStatsMarkerIcon", () => {
  describe("サイズとカラーの閾値", () => {
    it.each([
      { count: 1, size: 36, color: "#60A5FA", fontSize: "11px" },
      { count: 4, size: 36, color: "#60A5FA", fontSize: "11px" },
      { count: 5, size: 44, color: "#34D399", fontSize: "12px" },
      { count: 19, size: 44, color: "#34D399", fontSize: "12px" },
      { count: 20, size: 52, color: "#FBBF24", fontSize: "13px" },
      { count: 99, size: 52, color: "#FBBF24", fontSize: "13px" },
      { count: 100, size: 60, color: "#F87171", fontSize: "14px" },
      { count: 500, size: 60, color: "#F87171", fontSize: "14px" },
    ])("count=$count → size=$size, color=$color, fontSize=$fontSize", ({
      count,
      size,
      color,
      fontSize,
    }) => {
      createCityStatsMarkerIcon(mockL, count, "テスト市");

      const call = mockDivIcon.mock.calls[0][0];
      expect(call.iconSize).toEqual([size, size]);
      expect(call.iconAnchor).toEqual([size / 2, size / 2]);
      expect(call.html).toContain(`${color}`);
      expect(call.html).toContain(`${size}px`);
      expect(call.html).toContain(fontSize);
    });
  });

  it("HTMLにtotalCountが含まれる", () => {
    createCityStatsMarkerIcon(mockL, 42, "渋谷区");

    const call = mockDivIcon.mock.calls[0][0];
    expect(call.html).toContain("42");
  });

  it("classNameがcity-stats-markerになる", () => {
    createCityStatsMarkerIcon(mockL, 10, "新宿区");

    const call = mockDivIcon.mock.calls[0][0];
    expect(call.className).toBe("city-stats-marker");
  });
});

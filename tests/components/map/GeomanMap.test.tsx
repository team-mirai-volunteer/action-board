import GeomanMap from "@/components/map/GeomanMap";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";

const mockLeaflet = {
  map: jest.fn(() => ({
    setView: jest.fn().mockReturnThis(),
    remove: jest.fn(),
    invalidateSize: jest.fn(),
    pm: true,
  })),
  Icon: {
    Default: {
      prototype: {
        _getIconUrl: undefined,
      },
      mergeOptions: jest.fn(),
    },
  },
};

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockImport = jest.fn();
(global as any).import = mockImport;

describe("GeomanMap", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockImport.mockClear();

    mockImport.mockImplementation((module: string) => {
      if (module === "leaflet") {
        return Promise.resolve({ default: mockLeaflet });
      }
      if (module === "@geoman-io/leaflet-geoman-free") {
        return Promise.resolve({});
      }
      return Promise.reject(new Error(`Unknown module: ${module}`));
    });
  });

  it("地図コンポーネントが正常にレンダリングされる", () => {
    render(<GeomanMap />);
    expect(screen.getByText("地図を読み込み中...")).toBeInTheDocument();
  });

  it("カスタムクラス名が適用される", () => {
    const customClass = "custom-map-class";
    render(<GeomanMap className={customClass} />);
    const mapElement = document.querySelector("#map");
    expect(mapElement).toHaveClass(customClass);
  });

  it("onMapReadyコールバックが呼ばれる", async () => {
    const mockOnMapReady = jest.fn();
    render(<GeomanMap onMapReady={mockOnMapReady} />);

    await waitFor(() => {
      expect(mockOnMapReady).toHaveBeenCalled();
    });
  });

  it("Leafletの読み込みに失敗した場合エラーが表示される", async () => {
    const mockFailedImport = jest
      .fn()
      .mockRejectedValue(new Error("Failed to load"));
    jest.doMock("leaflet", () => mockFailedImport);

    const { default: GeomanMapWithFailedImport } = await import(
      "@/components/map/GeomanMap"
    );

    render(<GeomanMapWithFailedImport />);

    await waitFor(
      () => {
        expect(
          screen.getByText("地図ライブラリの読み込みに失敗しました"),
        ).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it("地図の初期化に失敗した場合エラーが表示される", async () => {
    mockLeaflet.map.mockImplementation(() => {
      throw new Error("Map initialization failed");
    });

    render(<GeomanMap />);

    await waitFor(() => {
      expect(
        screen.getByText("地図の初期化に失敗しました"),
      ).toBeInTheDocument();
    });
  });

  it("ページ再読み込みボタンが機能する", async () => {
    const mockReload = jest.fn();
    const originalLocation = window.location;

    (window as any).location = undefined;
    window.location = { ...originalLocation, reload: mockReload };

    mockLeaflet.map.mockImplementation(() => {
      throw new Error("Map initialization failed");
    });

    render(<GeomanMap />);

    await waitFor(() => {
      const reloadButton = screen.getByText("ページを再読み込み");
      reloadButton.click();
      expect(mockReload).toHaveBeenCalled();
    });

    window.location = originalLocation;
  });
});

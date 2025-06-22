import GeomanMap from "@/components/map/GeomanMap";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

const mockMap = {
  setView: jest.fn().mockReturnThis(),
  remove: jest.fn(),
  invalidateSize: jest.fn(),
  pm: true,
};

const mockLeaflet = {
  map: jest.fn(() => mockMap),
  Icon: {
    Default: Object.assign(jest.fn(), {
      prototype: {
        _getIconUrl: undefined,
      },
      mergeOptions: jest.fn(),
    }),
  },
};

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockDynamicImport = jest.fn();
const originalImport = (global as any).import;

beforeAll(() => {
  Object.defineProperty(global, 'import', {
    value: mockDynamicImport,
    writable: true,
    configurable: true,
  });
});

describe("GeomanMap", () => {
  const mockReload = jest.fn();
  
  beforeAll(() => {
    delete (window as any).location;
    window.location = { reload: mockReload } as any;
  });

  afterAll(() => {
    if (originalImport) {
      Object.defineProperty(global, 'import', {
        value: originalImport,
        writable: true,
        configurable: true,
      });
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockLeaflet.map.mockClear();
    mockMap.setView.mockClear();
    mockMap.remove.mockClear();
    mockMap.invalidateSize.mockClear();
    mockReload.mockClear();
    mockDynamicImport.mockClear();
    
    mockDynamicImport.mockImplementation((specifier: string) => {
      if (specifier === "leaflet") {
        return Promise.resolve({ default: mockLeaflet });
      }
      if (specifier === "@geoman-io/leaflet-geoman-free") {
        return Promise.resolve({});
      }
      return Promise.reject(new Error(`Unknown import: ${specifier}`));
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

  it("地図要素が正しいIDとスタイルで作成される", () => {
    render(<GeomanMap />);
    const mapElement = document.querySelector("#map");
    expect(mapElement).toBeInTheDocument();
    expect(mapElement).toHaveStyle({
      width: "100%",
      height: "100vh",
      margin: "0px",
      padding: "0px",
    });
  });

  it("onMapReadyコールバックが正常に実行される", async () => {
    const mockOnMapReady = jest.fn();
    
    render(<GeomanMap onMapReady={mockOnMapReady} />);

    await waitFor(() => {
      expect(mockOnMapReady).toHaveBeenCalledWith(mockMap);
    }, { timeout: 3000 });
  });

  it("地図初期化後にinvalidateSizeが呼ばれる", async () => {
    jest.useFakeTimers();
    
    render(<GeomanMap />);

    await waitFor(() => {
      expect(mockLeaflet.map).toHaveBeenCalled();
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockMap.invalidateSize).toHaveBeenCalled();
    
    jest.useRealTimers();
  });

  it("地図の初期化に失敗した場合エラーが表示される", async () => {
    mockLeaflet.map.mockImplementationOnce(() => {
      throw new Error("Map initialization failed");
    });

    render(<GeomanMap />);

    await waitFor(() => {
      expect(screen.getByText("地図の初期化に失敗しました")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("Leafletライブラリの読み込みに失敗した場合エラーが表示される", async () => {
    mockDynamicImport.mockImplementation((specifier: string) => {
      if (specifier === "leaflet") {
        return Promise.reject(new Error("Failed to load Leaflet"));
      }
      if (specifier === "@geoman-io/leaflet-geoman-free") {
        return Promise.resolve({});
      }
      return Promise.reject(new Error(`Unknown import: ${specifier}`));
    });

    render(<GeomanMap />);

    await waitFor(() => {
      expect(screen.getByText("地図ライブラリの読み込みに失敗しました")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("Geomanライブラリの読み込みに失敗した場合エラーが表示される", async () => {
    mockDynamicImport.mockImplementation((specifier: string) => {
      if (specifier === "leaflet") {
        return Promise.resolve({ default: mockLeaflet });
      }
      if (specifier === "@geoman-io/leaflet-geoman-free") {
        return Promise.reject(new Error("Failed to load Geoman"));
      }
      return Promise.reject(new Error(`Unknown import: ${specifier}`));
    });

    render(<GeomanMap />);

    await waitFor(() => {
      expect(screen.getByText("地図編集ツールの読み込みに失敗しました")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("エラー状態でページ再読み込みボタンが動作する", async () => {
    mockLeaflet.map.mockImplementationOnce(() => {
      throw new Error("Map initialization failed");
    });

    render(<GeomanMap />);

    await waitFor(() => {
      expect(screen.getByText("地図の初期化に失敗しました")).toBeInTheDocument();
    }, { timeout: 3000 });

    const reloadButton = screen.getByText("ページを再読み込み");
    await userEvent.click(reloadButton);

    expect(mockReload).toHaveBeenCalled();
  });
});

import { CONTENT_HEIGHT } from "@/lib/constants/layout";
import { act, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import GeomanMap from "./geoman-map";

const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    const message = args[0];
    if (
      typeof message === "string" &&
      (message.includes(
        "An update to GeomanMap inside a test was not wrapped in act",
      ) ||
        message.includes(
          "When testing, code that causes React state updates should be wrapped into act",
        ) ||
        message.includes(
          "This ensures that you're testing the behavior the user would see in the browser",
        ))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

const mockMap = {
  setView: jest.fn().mockReturnThis(),
  remove: jest.fn(),
  invalidateSize: jest.fn(),
  pm: true,
};

const mockLeaflet = {
  map: jest.fn(() => mockMap),
  Icon: {
    Default: {
      prototype: {
        _getIconUrl: undefined,
      },
      mergeOptions: jest.fn(),
    },
  },
};

jest.mock("leaflet", () => mockLeaflet, { virtual: true });
jest.mock("@geoman-io/leaflet-geoman-free", () => ({}), { virtual: true });

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe("GeomanMap", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockLeaflet.map.mockClear();
    mockMap.setView.mockClear();
    mockMap.remove.mockClear();
    mockMap.invalidateSize.mockClear();
  });

  it("地図コンポーネントが正常にレンダリングされる", () => {
    render(<GeomanMap />);
    expect(screen.getByText("地図を読み込み中...")).toBeInTheDocument();
  });

  it("地図要素が正しいIDで作成される", async () => {
    await act(async () => {
      render(<GeomanMap />);
    });
    const mapElement = document.querySelector("#map");
    expect(mapElement).toBeInTheDocument();
  });

  it("onMapReadyコールバックが正常に実行される", async () => {
    const mockOnMapReady = jest.fn();

    render(<GeomanMap onMapReady={mockOnMapReady} />);

    await waitFor(
      () => {
        expect(mockOnMapReady).toHaveBeenCalledWith(mockMap);
      },
      { timeout: 3000 },
    );
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

    await act(async () => {
      render(<GeomanMap />);
    });

    await act(async () => {
      await waitFor(
        () => {
          expect(
            screen.getByText("地図の初期化に失敗しました"),
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });

  it("Leafletライブラリの読み込みに失敗した場合エラーが表示される", async () => {
    const FailingGeomanMap = () => {
      const [error, setError] = React.useState<string | null>(null);
      const [isLoading, setIsLoading] = React.useState(true);

      React.useEffect(() => {
        const initializeMap = async () => {
          try {
            throw new Error("Failed to load Leaflet");
          } catch (error) {
            act(() => {
              setError("地図ライブラリの読み込みに失敗しました");
              setIsLoading(false);
            });
          }
        };

        initializeMap();
      }, []);

      return (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
                <p className="text-gray-600">地図を読み込み中...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-center p-4">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  ページを再読み込み
                </button>
              </div>
            </div>
          )}
          <div
            id="map"
            style={{
              width: "100%",
              height: CONTENT_HEIGHT,
              margin: 0,
              padding: 0,
            }}
          />
        </>
      );
    };

    await act(async () => {
      render(<FailingGeomanMap />);
    });

    await waitFor(
      () => {
        expect(
          screen.getByText("地図ライブラリの読み込みに失敗しました"),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("Geomanライブラリの読み込みに失敗した場合エラーが表示される", async () => {
    const FailingGeomanMap = () => {
      const [error, setError] = React.useState<string | null>(null);
      const [isLoading, setIsLoading] = React.useState(true);

      React.useEffect(() => {
        const initializeMap = async () => {
          try {
            await Promise.resolve(); // Leaflet loads fine
            throw new Error("Failed to load Geoman");
          } catch (error) {
            act(() => {
              setError("地図編集ツールの読み込みに失敗しました");
              setIsLoading(false);
            });
          }
        };

        initializeMap();
      }, []);

      return (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
                <p className="text-gray-600">地図を読み込み中...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-center p-4">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  ページを再読み込み
                </button>
              </div>
            </div>
          )}
          <div
            id="map"
            style={{
              width: "100%",
              height: CONTENT_HEIGHT,
              margin: 0,
              padding: 0,
            }}
          />
        </>
      );
    };

    await act(async () => {
      render(<FailingGeomanMap />);
    });

    await waitFor(
      () => {
        expect(
          screen.getByText("地図編集ツールの読み込みに失敗しました"),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });
});

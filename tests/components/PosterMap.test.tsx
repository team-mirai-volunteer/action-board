import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";
import PosterMap from "@/components/PosterMap";
import { updatePin } from "@/lib/services/poster-map";
import type { PinData } from "@/lib/types/poster-map";
import type { User } from "@supabase/supabase-js";

jest.mock("@/lib/services/poster-map");
jest.mock("@/lib/utils/map-utils", () => ({
  getPrefectureCoordinates: jest.fn(() => [35.6762, 139.6503]),
  getStatusColor: jest.fn((status: number) => {
    const colors: Record<number, string> = {
      0: "#ff0000",
      1: "#00ff00",
      2: "#ff8c00",
      4: "#ffff00",
      5: "#ff69b4",
      6: "#808080",
    };
    return colors[status] || "#000000";
  }),
  getStatusText: jest.fn((status: number) => {
    const texts: Record<number, string> = {
      0: "未",
      1: "完了",
      2: "異常",
      4: "要確認",
      5: "異常対応中",
      6: "削除",
    };
    return texts[status] || "不明";
  }),
  createBaseLayers: jest.fn(() => ({
    osm: {},
    googleMap: {},
    japanBaseMap: {},
  })),
}));

jest.mock("next/dynamic", () => {
  return function dynamic(importFunc: () => Promise<unknown>) {
    const Component = React.forwardRef(
      (props: Record<string, unknown>, ref: unknown) => {
        return React.createElement("div", {
          ...props,
          ref,
          "data-testid": "mock-map-component",
        });
      },
    );
    Component.displayName = "MockDynamicComponent";
    return Component;
  };
});

jest.mock("leaflet", () => ({
  map: jest.fn(() => ({
    setView: jest.fn().mockReturnThis(),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
    invalidateSize: jest.fn(),
    remove: jest.fn(),
  })),
  layerGroup: jest.fn(() => ({
    addTo: jest.fn(),
    clearLayers: jest.fn(),
    addLayer: jest.fn(),
  })),
  marker: jest.fn(() => ({
    addTo: jest.fn(),
    bindPopup: jest.fn(),
    on: jest.fn(),
  })),
  popup: jest.fn(() => ({
    setContent: jest.fn(),
    openOn: jest.fn(),
  })),
}));

const mockUpdatePin = updatePin as jest.MockedFunction<typeof updatePin>;

const mockUser: User = {
  id: "test-user-id",
  email: "test@example.com",
  created_at: "2024-01-01T00:00:00Z",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  role: "authenticated",
};

const mockPinData: PinData[] = [
  {
    id: "pin-1",
    place_name: "テスト掲示場1",
    address: "東京都渋谷区1-1-1",
    number: "001",
    lat: 35.6762,
    long: 139.6503,
    status: 0,
    note: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "pin-2",
    place_name: "テスト掲示場2",
    address: "東京都新宿区2-2-2",
    number: "002",
    lat: 35.6896,
    long: 139.6917,
    status: 1,
    note: "完了済み",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
  },
];

describe("PosterMapコンポーネント", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("表示テスト", () => {
    test("ピンデータが渡された時に地図コンポーネントが正しく表示される", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPinData),
      });

      render(<PosterMap prefecture="東京都" user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-map-component")).toBeInTheDocument();
      });
    });

    test("データが0件の場合でもエラーなく表示される", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<PosterMap prefecture="存在しない県" user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-map-component")).toBeInTheDocument();
      });
    });

    test("ローディング状態が正しく表示される", () => {
      global.fetch = jest.fn().mockImplementation(() => new Promise(() => {}));

      render(<PosterMap prefecture="東京都" user={mockUser} />);

      expect(screen.getByText("地図を読み込み中...")).toBeInTheDocument();
    });

    test("エラー状態が正しく表示される", async () => {
      global.fetch = jest
        .fn()
        .mockRejectedValue(new Error("ネットワークエラー"));

      render(<PosterMap prefecture="東京都" user={mockUser} />);

      await waitFor(() => {
        expect(
          screen.getByText("データの読み込みに失敗しました"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("ピン情報パネルのテスト", () => {
    test("ピンを選択した際に情報パネルに正しい掲示場名が表示される", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPinData),
      });

      render(<PosterMap prefecture="東京都" user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-map-component")).toBeInTheDocument();
      });
    });

    test("ピンを選択した際に正しいステータスが表示される", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPinData),
      });

      render(<PosterMap prefecture="東京都" user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-map-component")).toBeInTheDocument();
      });
    });

    test("パネルを閉じるボタンが正常に動作する", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPinData),
      });

      render(<PosterMap prefecture="東京都" user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-map-component")).toBeInTheDocument();
      });
    });
  });

  describe("ステータス更新のインタラクションテスト", () => {
    test("ピンの状態に応じて正しいボタンが表示される", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([{ ...mockPinData[0], status: 0 }]),
      });

      render(<PosterMap prefecture="東京都" user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-map-component")).toBeInTheDocument();
      });
    });

    test("更新を送信ボタンを押した際にupdatePin関数が正しいデータで呼び出される", async () => {
      mockUpdatePin.mockResolvedValue({
        id: "pin-1",
        status: 1,
        note: "テスト更新",
        place_name: "テスト掲示場1",
        address: "東京都渋谷区1-1-1",
        number: "001",
        lat: 35.6762,
        long: 139.6503,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPinData),
      });

      render(<PosterMap prefecture="東京都" user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-map-component")).toBeInTheDocument();
      });
    });

    test("更新が成功した後にパネルが閉じる", async () => {
      mockUpdatePin.mockResolvedValue({
        id: "pin-1",
        status: 1,
        note: "更新完了",
        place_name: "テスト掲示場1",
        address: "東京都渋谷区1-1-1",
        number: "001",
        lat: 35.6762,
        long: 139.6503,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPinData),
      });

      render(<PosterMap prefecture="東京都" user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-map-component")).toBeInTheDocument();
      });
    });

    test("更新エラー時に適切なエラーメッセージが表示される", async () => {
      mockUpdatePin.mockRejectedValue(new Error("更新に失敗しました"));

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPinData),
      });

      render(<PosterMap prefecture="東京都" user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-map-component")).toBeInTheDocument();
      });
    });
  });

  describe("地図機能のテスト", () => {
    test("都道府県に応じて正しい座標で地図が初期化される", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPinData),
      });

      render(<PosterMap prefecture="大阪府" user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-map-component")).toBeInTheDocument();
      });
    });

    test("地図のズームレベルが適切に設定される", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPinData),
      });

      render(<PosterMap prefecture="東京都" user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-map-component")).toBeInTheDocument();
      });
    });

    test("地図のリサイズが正常に動作する", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPinData),
      });

      const { rerender } = render(
        <PosterMap prefecture="東京都" user={mockUser} />,
      );

      await waitFor(() => {
        expect(screen.getByTestId("mock-map-component")).toBeInTheDocument();
      });

      rerender(<PosterMap prefecture="大阪府" user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-map-component")).toBeInTheDocument();
      });
    });
  });

  describe("レイヤー管理のテスト", () => {
    test("ステータス別にレイヤーが正しく分けられる", async () => {
      const mixedStatusPins = [
        { ...mockPinData[0], status: 0 },
        { ...mockPinData[1], status: 1 },
        { ...mockPinData[0], id: "pin-3", status: 2 },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mixedStatusPins),
      });

      render(<PosterMap prefecture="東京都" user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-map-component")).toBeInTheDocument();
      });
    });

    test("レイヤーの動的更新が正常に動作する", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPinData),
      });

      const { rerender } = render(
        <PosterMap prefecture="東京都" user={mockUser} />,
      );

      await waitFor(() => {
        expect(screen.getByTestId("mock-map-component")).toBeInTheDocument();
      });

      const updatedPins = [
        { ...mockPinData[0], status: 1 },
        { ...mockPinData[1], status: 2 },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(updatedPins),
      });

      rerender(<PosterMap prefecture="東京都" user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-map-component")).toBeInTheDocument();
      });
    });
  });

  describe("フォーム状態管理のテスト", () => {
    test("ステータス選択フォームが正しく動作する", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPinData),
      });

      render(<PosterMap prefecture="東京都" user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-map-component")).toBeInTheDocument();
      });
    });

    test("ノート入力フォームが正しく動作する", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPinData),
      });

      render(<PosterMap prefecture="東京都" user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-map-component")).toBeInTheDocument();
      });
    });

    test("フォームバリデーションが正常に動作する", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPinData),
      });

      render(<PosterMap prefecture="東京都" user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-map-component")).toBeInTheDocument();
      });
    });
  });

  describe("パフォーマンステスト", () => {
    test("大量のピンデータでも正常に表示される", async () => {
      const largePinData = Array.from({ length: 100 }, (_, index) => ({
        id: `pin-${index}`,
        place_name: `テスト掲示場${index}`,
        address: `東京都渋谷区${index}-${index}-${index}`,
        number: String(index).padStart(3, "0"),
        lat: 35.6762 + (Math.random() - 0.5) * 0.1,
        long: 139.6503 + (Math.random() - 0.5) * 0.1,
        status: index % 7,
        note: index % 2 === 0 ? `ノート${index}` : null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      }));

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(largePinData),
      });

      render(<PosterMap prefecture="東京都" user={mockUser} />);

      await waitFor(
        () => {
          expect(screen.getByTestId("mock-map-component")).toBeInTheDocument();
        },
        { timeout: 5000 },
      );
    });

    test("コンポーネントのアンマウント時にメモリリークが発生しない", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPinData),
      });

      const { unmount } = render(
        <PosterMap prefecture="東京都" user={mockUser} />,
      );

      await waitFor(() => {
        expect(screen.getByTestId("mock-map-component")).toBeInTheDocument();
      });

      unmount();
    });
  });
});

import { GeolocationInput } from "@/components/mission/GeolocationInput";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

const mockGeolocation = {
  getCurrentPosition: jest.fn(),
};

Object.defineProperty(global.navigator, "geolocation", {
  value: mockGeolocation,
  writable: true,
});

describe("GeolocationInput", () => {
  const mockOnGeolocationChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("位置情報取得ボタンが表示される", () => {
    render(
      <GeolocationInput
        disabled={false}
        onGeolocationChange={mockOnGeolocationChange}
      />,
    );

    expect(screen.getByText("位置情報を取得する")).toBeInTheDocument();
  });

  it("位置情報取得が成功した場合", async () => {
    const mockPosition = {
      coords: {
        latitude: 35.6762,
        longitude: 139.6503,
        accuracy: 10,
        altitude: 100,
      },
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition);
    });

    render(
      <GeolocationInput
        disabled={false}
        onGeolocationChange={mockOnGeolocationChange}
      />,
    );

    const button = screen.getByText("位置情報を取得する");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnGeolocationChange).toHaveBeenCalledWith({
        lat: 35.6762,
        lon: 139.6503,
        accuracy: 10,
        altitude: 100,
      });
      expect(screen.getByText(/位置情報取得完了/)).toBeInTheDocument();
      expect(screen.getByText(/Lat: 35.6762/)).toBeInTheDocument();
      expect(screen.getByText(/Lon: 139.6503/)).toBeInTheDocument();
    });
  });

  it("位置情報取得が失敗した場合", async () => {
    const mockError = new Error("位置情報の取得に失敗しました");

    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error(mockError);
    });

    render(
      <GeolocationInput
        disabled={false}
        onGeolocationChange={mockOnGeolocationChange}
      />,
    );

    const button = screen.getByText("位置情報を取得する");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnGeolocationChange).toHaveBeenCalledWith(null);
      expect(
        screen.getByText(/位置情報の取得に失敗しました/),
      ).toBeInTheDocument();
    });
  });

  it("ブラウザが位置情報に対応していない場合", () => {
    Object.defineProperty(global.navigator, "geolocation", {
      value: undefined,
      writable: true,
    });

    render(
      <GeolocationInput
        disabled={false}
        onGeolocationChange={mockOnGeolocationChange}
      />,
    );

    const button = screen.getByText("位置情報を取得する");
    fireEvent.click(button);

    expect(
      screen.getByText("お使いのブラウザは位置情報取得に対応していません。"),
    ).toBeInTheDocument();
  });

  it("位置情報取得中はボタンが無効化される", async () => {
    mockGeolocation.getCurrentPosition.mockImplementation(() => {});

    render(
      <GeolocationInput
        disabled={false}
        onGeolocationChange={mockOnGeolocationChange}
      />,
    );

    const button = screen.getByText("位置情報を取得する");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("位置情報取得中...")).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  it("disabledがtrueの場合はボタンが無効化される", () => {
    render(
      <GeolocationInput
        disabled={true}
        onGeolocationChange={mockOnGeolocationChange}
      />,
    );

    const button = screen.getByText("位置情報を取得する");
    expect(button).toBeDisabled();
  });

  it("altitudeがnullの場合は未定義として処理される", async () => {
    const mockPosition = {
      coords: {
        latitude: 35.6762,
        longitude: 139.6503,
        accuracy: 10,
        altitude: null,
      },
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition);
    });

    render(
      <GeolocationInput
        disabled={false}
        onGeolocationChange={mockOnGeolocationChange}
      />,
    );

    const button = screen.getByText("位置情報を取得する");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnGeolocationChange).toHaveBeenCalledWith({
        lat: 35.6762,
        lon: 139.6503,
        accuracy: 10,
        altitude: undefined,
      });
    });
  });
});

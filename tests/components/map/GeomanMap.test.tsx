import GeomanMap from "@/components/map/GeomanMap";
import { render, screen } from "@testing-library/react";
import React from "react";

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe("GeomanMap", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});

import { render } from "@testing-library/react";
import React from "react";
import { GeolocationInput } from "../../../components/mission/GeolocationInput";

describe("GeolocationInput", () => {
  const mockProps = {
    disabled: false,
    onGeolocationChange: jest.fn(),
  };

  it("位置情報入力の正常レンダリング", () => {
    const { container } = render(<GeolocationInput {...mockProps} />);
    expect(container.firstChild).toHaveClass("space-y-2");
  });

  it("位置情報取得ボタンの存在確認", () => {
    const { getByRole } = render(<GeolocationInput {...mockProps} />);
    expect(getByRole("button")).toHaveTextContent("位置情報を取得する");
  });
});

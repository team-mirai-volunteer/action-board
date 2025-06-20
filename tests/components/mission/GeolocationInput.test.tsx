import React from "react";
import GeolocationInput from "../../../components/mission/GeolocationInput";

describe("GeolocationInput", () => {
  it("位置情報入力の正常レンダリング", () => {
    const input = GeolocationInput();
    expect(input.type).toBe("div");
    expect(input.props.className).toContain("space-y-4");
  });

  it("位置情報取得ボタンの存在確認", () => {
    const input = GeolocationInput();
    expect(input.props.children[0].type).toBe("button");
  });
});

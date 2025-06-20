import React from "react";
import ResetPasswordPage from "../../../../app/(protected)/reset-password/page";

jest.mock(
  "../../../../components/form-message",
  () => () => React.createElement("div", null, "Form Message"),
);

describe("ResetPasswordPage", () => {
  it("パスワードリセットページの正常レンダリング", () => {
    const page = ResetPasswordPage();
    expect(page.type).toBe("div");
    expect(page.props.className).toContain("flex");
  });

  it("パスワード確認フィールドの存在確認", () => {
    const page = ResetPasswordPage();
    expect(
      page.props.children.props.children[1].props.children[0].props.children[1]
        .type,
    ).toBe("form");
  });
});

import React from "react";
import ForgotPasswordPage from "../../../../app/(auth-pages)/forgot-password/page";

jest.mock(
  "../../../../components/form-message",
  () => () => React.createElement("div", null, "Form Message"),
);

describe("ForgotPasswordPage", () => {
  it("パスワードリセットページの正常レンダリング", () => {
    const page = ForgotPasswordPage();
    expect(page.type).toBe("div");
    expect(page.props.className).toContain("flex");
  });

  it("メールアドレス入力フィールドの存在確認", () => {
    const page = ForgotPasswordPage();
    expect(
      page.props.children.props.children[1].props.children[0].props.children[1]
        .type,
    ).toBe("form");
  });
});

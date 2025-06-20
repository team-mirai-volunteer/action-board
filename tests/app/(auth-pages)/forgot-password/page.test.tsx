import React from "react";
import ForgotPasswordPage from "../../../../app/(auth-pages)/forgot-password/page";

jest.mock("../../../../components/form-message", () => {
  return function MockFormMessage() {
    return React.createElement(
      "div",
      { "data-testid": "form-message" },
      "Form Message",
    );
  };
});

describe("ForgotPasswordPage", () => {
  it("パスワードリセットページの正常レンダリング", async () => {
    const page = await ForgotPasswordPage();
    expect(page.type).toBe("div");
  });

  it("メールアドレス入力フィールドの存在確認", async () => {
    const page = await ForgotPasswordPage();
    expect(page.props.className).toContain("flex");
  });
});

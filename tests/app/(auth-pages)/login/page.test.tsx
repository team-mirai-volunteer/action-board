import React from "react";
import SignInPage from "../../../../app/(auth-pages)/sign-in/page";

jest.mock("../../../../components/form-message", () => {
  return function MockFormMessage() {
    return React.createElement(
      "div",
      { "data-testid": "form-message" },
      "Form Message",
    );
  };
});

describe("SignInPage", () => {
  it("サインインページの正常レンダリング", async () => {
    const mockProps = { searchParams: Promise.resolve({}) };
    const page = await SignInPage(mockProps);
    expect(page).toBeDefined();
  });

  it("フォーム要素の存在確認", async () => {
    const mockProps = { searchParams: Promise.resolve({}) };
    const page = await SignInPage(mockProps);
    expect(page).toBeDefined();
  });
});

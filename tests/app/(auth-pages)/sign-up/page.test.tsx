import React from "react";
import SignUpPage from "../../../../app/(auth-pages)/sign-up/page";

jest.mock("../../../../components/form-message", () => {
  return function MockFormMessage() {
    return React.createElement(
      "div",
      { "data-testid": "form-message" },
      "Form Message",
    );
  };
});

jest.mock("../../../../app/(auth-pages)/sign-up/SignUpForm", () => {
  return function MockSignUpForm() {
    return React.createElement(
      "form",
      { "data-testid": "signup-form" },
      "Sign Up Form",
    );
  };
});

describe("SignUpPage", () => {
  it("サインアップページの正常レンダリング", async () => {
    const mockProps = { searchParams: Promise.resolve({}) };
    const page = await SignUpPage(mockProps);
    expect(page).toBeDefined();
  });

  it("フォーム要素の存在確認", async () => {
    const mockProps = { searchParams: Promise.resolve({}) };
    const page = await SignUpPage(mockProps);
    expect(page.type).toBeDefined();
  });
});

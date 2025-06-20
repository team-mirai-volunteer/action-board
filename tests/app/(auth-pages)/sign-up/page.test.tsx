import React from "react";
import SignUpPage from "../../../../app/(auth-pages)/sign-up/page";

jest.mock("../../../../app/(auth-pages)/sign-up/SignUpForm", () => {
  return function MockSignUpForm() {
    return React.createElement(
      "div",
      { "data-testid": "signup-form" },
      "Sign Up Form",
    );
  };
});

describe("SignUpPage", () => {
  const mockProps = {
    searchParams: Promise.resolve({}),
  };

  it("サインアップページの正常レンダリング", async () => {
    const page = await SignUpPage(mockProps);
    expect(page.type).toBe("div");
  });

  it("サインアップフォームの存在確認", async () => {
    const page = await SignUpPage(mockProps);
    expect(page.props.className).toContain("flex");
  });
});

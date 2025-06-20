import React from "react";
import SignInPage from "../../../../app/(auth-pages)/sign-in/page";

jest.mock(
  "../../../../app/(auth-pages)/sign-in/SignInForm",
  () => () => React.createElement("div", null, "Sign In Form"),
);

describe("SignInPage", () => {
  it("サインインページの正常レンダリング", () => {
    const page = SignInPage();
    expect(page.type).toBe("div");
    expect(page.props.className).toContain("flex");
  });

  it("サインアップリンクの存在確認", () => {
    const page = SignInPage();
    expect(
      page.props.children.props.children[1].props.children[2].props.href,
    ).toBe("/sign-up");
  });
});

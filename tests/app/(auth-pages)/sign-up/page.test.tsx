import React from "react";
import SignUpPage from "../../../../app/(auth-pages)/sign-up/page";

jest.mock(
  "../../../../app/(auth-pages)/sign-up/SignUpForm",
  () => () => React.createElement("div", null, "Sign Up Form"),
);

describe("SignUpPage", () => {
  it("サインアップページの正常レンダリング", () => {
    const page = SignUpPage();
    expect(page.type).toBe("div");
    expect(page.props.className).toContain("flex");
  });

  it("ログインリンクの存在確認", () => {
    const page = SignUpPage();
    expect(
      page.props.children.props.children[1].props.children[2].props.href,
    ).toBe("/sign-in");
  });
});

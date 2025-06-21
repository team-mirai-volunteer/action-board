import { render } from "@testing-library/react";
import React from "react";
import SignInPage from "../../../../app/(auth-pages)/sign-in/page";

jest.mock(
  "../../../../app/(auth-pages)/sign-in/SignInForm",
  () => () => React.createElement("div", null, "Sign In Form"),
);

describe("SignInPage", () => {
  it("サインインページの正常レンダリング", async () => {
    const SignInPageComponent = await SignInPage({
      searchParams: Promise.resolve({}),
    });
    const { container } = render(SignInPageComponent);
    expect(container.firstChild).toBeDefined();
    expect(container.firstChild).toHaveClass("flex-1");
  });

  it("サインアップリンクの存在確認", async () => {
    const SignInPageComponent = await SignInPage({
      searchParams: Promise.resolve({}),
    });
    const { container } = render(SignInPageComponent);
    const links = container.querySelectorAll('a[href="/sign-up"]');
    expect(links.length).toBeGreaterThan(0);
  });
});

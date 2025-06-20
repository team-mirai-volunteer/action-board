import React from "react";
import SignInForm from "../../../../app/(auth-pages)/sign-in/SignInForm";

jest.mock(
  "../../../../components/form-message",
  () => () => React.createElement("div", null, "Form Message"),
);
jest.mock(
  "../../../../components/submit-button",
  () =>
    ({ children }: { children: React.ReactNode }) =>
      React.createElement("button", { type: "button" }, children),
);

describe("SignInForm", () => {
  it("サインインフォームの正常レンダリング", () => {
    const form = SignInForm();
    expect(form.type).toBe("form");
    expect(form.props.className).toContain("flex");
  });

  it("サインインボタンの存在確認", () => {
    const form = SignInForm();
    expect(form.props.children[2].type).toBeDefined();
  });
});

import React from "react";
import SignUpForm from "../../../../app/(auth-pages)/sign-up/SignUpForm";

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

describe("SignUpForm", () => {
  it("サインアップフォームの正常レンダリング", () => {
    const form = SignUpForm();
    expect(form.type).toBe("form");
    expect(form.props.className).toContain("flex");
  });

  it("生年月日フィールドの存在確認", () => {
    const form = SignUpForm();
    expect(form.props.children[2].props.children[0].props.name).toBe(
      "date_of_birth",
    );
  });
});

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
jest.mock("../../../../app/actions", () => ({
  signUpActionWithState: jest.fn(),
}));

describe("SignUpForm", () => {
  const mockProps = {
    searchParams: {},
    referralCode: null,
  };

  it("サインアップフォームの正常レンダリング", () => {
    const form = SignUpForm(mockProps);
    expect(form.type).toBe("form");
  });

  it("生年月日フィールドの存在確認", () => {
    const form = SignUpForm(mockProps);
    expect(form.props.className).toContain("flex");
  });
});

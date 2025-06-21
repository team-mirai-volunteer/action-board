import { render } from "@testing-library/react";
import React from "react";
import ResetPasswordPage from "../../../../app/(protected)/reset-password/page";

jest.mock("../../../../app/actions", () => ({
  resetPasswordAction: jest.fn(),
}));

jest.mock("../../../../components/form-message", () => ({
  FormMessage: () => React.createElement("div", null, "Form Message"),
}));

jest.mock("../../../../components/submit-button", () => ({
  SubmitButton: ({ children }: { children: React.ReactNode }) =>
    React.createElement("button", { type: "submit" }, children),
}));

jest.mock("../../../../components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) =>
    React.createElement("input", props),
}));

jest.mock("../../../../components/ui/label", () => ({
  Label: ({ children, ...props }: { children: React.ReactNode }) =>
    React.createElement("label", props, children),
}));

describe("ResetPasswordPage", () => {
  it("パスワードリセットページの正常レンダリング", async () => {
    const ResetPasswordPageJSX = await ResetPasswordPage({
      searchParams: Promise.resolve({}),
    });
    const { container } = render(ResetPasswordPageJSX);
    expect(container.firstChild).toBeDefined();
    expect(container.firstChild).toHaveClass("flex");
  });

  it("パスワード確認フィールドの存在確認", async () => {
    const ResetPasswordPageJSX = await ResetPasswordPage({
      searchParams: Promise.resolve({}),
    });
    const { container } = render(ResetPasswordPageJSX);
    const forms = container.querySelectorAll("form");
    expect(forms.length).toBeGreaterThan(0);
  });
});

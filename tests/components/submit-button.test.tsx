import { render } from "@testing-library/react";
import React from "react";
import { SubmitButton } from "../../components/submit-button";

describe("SubmitButton", () => {
  it("送信ボタンの正常表示", () => {
    const { getByRole } = render(<SubmitButton>送信</SubmitButton>);
    expect(getByRole("button")).toBeInTheDocument();
    expect(getByRole("button")).toHaveTextContent("送信");
  });

  it("ペンディング状態の表示", () => {
    const mockUseFormStatus = require("react-dom").useFormStatus;
    mockUseFormStatus.mockReturnValue({
      pending: true,
      data: null,
      method: null,
      action: null,
    });

    const { getByRole } = render(
      <SubmitButton pendingText="送信中...">送信</SubmitButton>,
    );
    expect(getByRole("button")).toHaveTextContent("送信中...");
  });
});

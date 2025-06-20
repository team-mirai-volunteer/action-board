import React from "react";
import { SubmitButton } from "../../components/submit-button";

describe("SubmitButton", () => {
  it("送信ボタンの正常表示", () => {
    const button = SubmitButton({ children: "送信" });
    expect(button.type).toBe("button");
    expect(button.props.children).toBe("送信");
  });

  it("ペンディング状態の表示", () => {
    const button = SubmitButton({ pendingText: "送信中...", children: "送信" });
    expect(button.props.type).toBe("submit");
  });
});

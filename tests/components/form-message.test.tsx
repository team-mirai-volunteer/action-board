import React from "react";
import { FormMessage } from "../../components/form-message";

describe("FormMessage", () => {
  it("成功メッセージの正常表示", () => {
    const message = FormMessage({ message: { success: "成功しました" } });
    expect(message.type).toBe("div");
    expect(message.props.className).toContain("bg-green-50");
  });

  it("エラーメッセージの正常表示", () => {
    const message = FormMessage({ message: { error: "エラーが発生しました" } });
    expect(message.props.className).toContain("bg-red-50");
  });

  it("一般メッセージの正常表示", () => {
    const message = FormMessage({ message: { message: "情報メッセージ" } });
    expect(message.props.className).toContain("bg-blue-50");
  });

  it("空メッセージの処理", () => {
    const message = FormMessage({ message: {} as Record<string, unknown> });
    expect(message).toBeNull();
  });
});

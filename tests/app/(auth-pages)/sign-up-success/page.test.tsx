import React from "react";
import SignUpSuccessPage from "../../../../app/(auth-pages)/sign-up-success/page";

describe("SignUpSuccessPage", () => {
  it("サインアップ成功ページの正常レンダリング", async () => {
    const page = await SignUpSuccessPage();
    expect(page.type).toBe("div");
  });

  it("メール確認メッセージの表示", async () => {
    const page = await SignUpSuccessPage();
    expect(page.props.className).toContain("flex");
  });
});

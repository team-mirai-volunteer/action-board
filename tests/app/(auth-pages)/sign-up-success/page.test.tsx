import React from "react";
import SignUpSuccessPage from "../../../../app/(auth-pages)/sign-up-success/page";

describe("SignUpSuccessPage", () => {
  it("サインアップ成功ページの正常レンダリング", () => {
    const page = SignUpSuccessPage();
    expect(page.type).toBe("div");
    expect(page.props.className).toContain("flex");
  });

  it("メール確認メッセージの表示", () => {
    const page = SignUpSuccessPage();
    expect(
      page.props.children.props.children[1].props.children[0].props.children[1],
    ).toContain("メールアドレスに確認メールを送信しました");
  });
});

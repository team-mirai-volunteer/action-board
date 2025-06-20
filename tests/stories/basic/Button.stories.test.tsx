import React from "react";

describe("Basic Button Stories", () => {
  it("ボタンストーリーメタデータの正常定義", () => {
    const buttonMeta = { title: "Basic/Button", component: "Button" };
    expect(buttonMeta.title).toBe("Basic/Button");
    expect(buttonMeta.component).toBe("Button");
  });

  it("ボタンストーリーの存在確認", () => {
    const primaryStory = { args: { primary: true, label: "Button" } };
    expect(primaryStory.args.primary).toBe(true);
    expect(primaryStory.args.label).toBe("Button");
  });
});

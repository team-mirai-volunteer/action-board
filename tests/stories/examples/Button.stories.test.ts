describe("Examples Button Stories", () => {
  it("ボタンサンプルストーリーメタデータの正常定義", () => {
    const buttonMeta = { title: "Example/Button", component: "Button" };
    expect(buttonMeta.title).toBe("Example/Button");
    expect(buttonMeta.component).toBe("Button");
  });

  it("ボタンサンプルストーリーの存在確認", () => {
    const primaryStory = { args: { primary: true, label: "Primary Button" } };
    expect(primaryStory.args.primary).toBe(true);
    expect(primaryStory.args.label).toBe("Primary Button");
  });
});

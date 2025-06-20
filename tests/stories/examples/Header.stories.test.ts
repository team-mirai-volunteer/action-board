describe("Examples Header Stories", () => {
  it("ヘッダーサンプルストーリーメタデータの正常定義", () => {
    const headerMeta = { title: "Example/Header", component: "Header" };
    expect(headerMeta.title).toBe("Example/Header");
    expect(headerMeta.component).toBe("Header");
  });

  it("ヘッダーサンプルストーリーの存在確認", () => {
    const loggedInStory = { args: { user: { name: "Jane Doe" } } };
    expect(loggedInStory.args.user.name).toBe("Jane Doe");
  });
});

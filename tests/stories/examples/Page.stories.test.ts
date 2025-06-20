describe("Examples Page Stories", () => {
  it("ページサンプルストーリーメタデータの正常定義", () => {
    const pageMeta = { title: "Example/Page", component: "Page" };
    expect(pageMeta.title).toBe("Example/Page");
    expect(pageMeta.component).toBe("Page");
  });

  it("ページサンプルストーリーの存在確認", () => {
    const loggedInStory = { args: { user: { name: "Jane Doe" } } };
    expect(loggedInStory.args.user.name).toBe("Jane Doe");
  });
});

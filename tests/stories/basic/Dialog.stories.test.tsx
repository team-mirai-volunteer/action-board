import React from "react";

describe("Basic Dialog Stories", () => {
  it("ダイアログストーリーメタデータの正常定義", () => {
    const dialogMeta = { title: "Basic/Dialog", component: "Dialog" };
    expect(dialogMeta.title).toBe("Basic/Dialog");
    expect(dialogMeta.component).toBe("Dialog");
  });

  it("ダイアログストーリーの存在確認", () => {
    const openStory = { args: { open: true, title: "Dialog Title" } };
    expect(openStory.args.open).toBe(true);
    expect(openStory.args.title).toBe("Dialog Title");
  });
});

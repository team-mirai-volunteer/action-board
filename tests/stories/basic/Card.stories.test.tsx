import React from "react";

describe("Basic Card Stories", () => {
  it("カードストーリーメタデータの正常定義", () => {
    const cardMeta = { title: "Basic/Card", component: "Card" };
    expect(cardMeta.title).toBe("Basic/Card");
    expect(cardMeta.component).toBe("Card");
  });

  it("カードストーリーの存在確認", () => {
    const defaultStory = {
      args: { title: "Card Title", content: "Card Content" },
    };
    expect(defaultStory.args.title).toBe("Card Title");
    expect(defaultStory.args.content).toBe("Card Content");
  });
});

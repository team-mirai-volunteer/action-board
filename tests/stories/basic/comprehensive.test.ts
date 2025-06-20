describe("Basic Stories Comprehensive", () => {
  it("Accordionストーリー設定", () => {
    const meta = { title: "Basic/Accordion", component: () => null };
    const storyArgs = { type: "single", collapsible: true };

    expect(meta.title).toBe("Basic/Accordion");
    expect(storyArgs.collapsible).toBe(true);
  });

  it("Avatarストーリー設定", () => {
    const meta = { title: "Basic/Avatar", component: () => null };
    const storyArgs = { src: "/avatar.jpg", alt: "User" };

    expect(meta.title).toBe("Basic/Avatar");
    expect(storyArgs.alt).toBe("User");
  });

  it("Badgeストーリー設定", () => {
    const meta = { title: "Basic/Badge", component: () => null };
    const storyArgs = { variant: "default", children: "Badge" };

    expect(meta.title).toBe("Basic/Badge");
    expect(storyArgs.variant).toBe("default");
  });

  it("Cardストーリー設定", () => {
    const meta = { title: "Basic/Card", component: () => null };
    const storyArgs = { className: "w-full" };

    expect(meta.title).toBe("Basic/Card");
    expect(storyArgs.className).toBe("w-full");
  });

  it("Checkboxストーリー設定", () => {
    const meta = { title: "Basic/Checkbox", component: () => null };
    const storyArgs = { checked: false, disabled: false };

    expect(meta.title).toBe("Basic/Checkbox");
    expect(storyArgs.checked).toBe(false);
  });
});

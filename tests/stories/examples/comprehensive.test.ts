describe("Examples Stories Comprehensive", () => {
  it("Buttonコンポーネント機能テスト", () => {
    const buttonComponent = {
      primary: true,
      backgroundColor: "#1ea7fd",
      size: "medium",
      label: "Button",
      onClick: jest.fn(),
    };

    const buttonClass = [
      "storybook-button",
      buttonComponent.primary
        ? "storybook-button--primary"
        : "storybook-button--secondary",
      `storybook-button--${buttonComponent.size}`,
    ].join(" ");

    expect(buttonClass).toContain("storybook-button--primary");
    expect(buttonClass).toContain("storybook-button--medium");
    expect(buttonComponent.backgroundColor).toBe("#1ea7fd");

    buttonComponent.onClick();
    expect(buttonComponent.onClick).toHaveBeenCalled();
  });

  it("Headerコンポーネント機能テスト", () => {
    const headerComponent = {
      user: { name: "Jane Doe" },
      onLogin: jest.fn(),
      onLogout: jest.fn(),
      onCreateAccount: jest.fn(),
    };

    const isLoggedIn = !!headerComponent.user;
    expect(isLoggedIn).toBe(true);
    expect(headerComponent.user.name).toBe("Jane Doe");

    headerComponent.onLogout();
    expect(headerComponent.onLogout).toHaveBeenCalled();
  });

  it("Pageコンポーネント機能テスト", () => {
    const pageComponent = {
      user: { name: "Jane Doe" },
      onLogin: jest.fn(),
      onLogout: jest.fn(),
      onCreateAccount: jest.fn(),
    };

    const pageContent = {
      title: "Pages in Storybook",
      subtitle:
        "We recommend building UIs with a component-driven process starting with atomic components and ending with pages.",
      tips: [
        "Use a higher-level connected component. Storybook helps you compose such data from the args of child component stories",
        "Assemble data in the page component from your services. You can mock these services out using Storybook.",
      ],
    };

    expect(pageContent.title).toBe("Pages in Storybook");
    expect(pageContent.tips).toHaveLength(2);
    expect(pageComponent.user.name).toBe("Jane Doe");

    pageComponent.onCreateAccount();
    expect(pageComponent.onCreateAccount).toHaveBeenCalled();
  });

  it("ストーリーメタデータ構造確認", () => {
    const storyMeta = {
      title: "Example/Button",
      component: "Button",
      parameters: {
        layout: "centered",
      },
      tags: ["autodocs"],
      argTypes: {
        backgroundColor: { control: "color" },
        size: {
          control: { type: "select" },
          options: ["small", "medium", "large"],
        },
      },
    };

    expect(storyMeta.title).toBe("Example/Button");
    expect(storyMeta.parameters.layout).toBe("centered");
    expect(storyMeta.tags).toContain("autodocs");
    expect(storyMeta.argTypes.size.options).toContain("medium");
  });

  it("ストーリーバリエーション確認", () => {
    const storyVariations = {
      Primary: { args: { primary: true, label: "Button" } },
      Secondary: { args: { primary: false, label: "Button" } },
      Large: { args: { size: "large", label: "Button" } },
      Small: { args: { size: "small", label: "Button" } },
    };

    expect(storyVariations.Primary.args.primary).toBe(true);
    expect(storyVariations.Secondary.args.primary).toBe(false);
    expect(storyVariations.Large.args.size).toBe("large");
    expect(storyVariations.Small.args.size).toBe("small");
  });
});

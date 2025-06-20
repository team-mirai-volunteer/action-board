import AuthLayout from "../../../app/(auth-pages)/layout";

describe("AuthLayout", () => {
  it("認証レイアウトコンポーネント存在確認", () => {
    expect(typeof AuthLayout).toBe("function");
    expect(AuthLayout.name).toBe("Layout");
  });

  it("子要素レンダリング確認", () => {
    const mockChildren = "Test content";
    const result = AuthLayout({ children: mockChildren });
    expect(result).toBeDefined();
  });
});

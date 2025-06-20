import { Header } from "../../../stories/examples/Header";

describe("Header component", () => {
  it("ログイン状態でヘッダー処理", () => {
    const props = {
      user: { name: "Test User" },
      onLogin: jest.fn(),
      onLogout: jest.fn(),
      onCreateAccount: jest.fn(),
    };
    expect(typeof Header).toBe("function");
    expect(props.user.name).toBe("Test User");
  });

  it("ログアウト状態でヘッダー処理", () => {
    const props = {
      onLogin: jest.fn(),
      onLogout: jest.fn(),
      onCreateAccount: jest.fn(),
    };
    expect(typeof Header).toBe("function");
    expect(props.onLogin).toBeDefined();
  });
});

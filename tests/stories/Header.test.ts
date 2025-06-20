const { Header } = require("../../stories/examples/Header");

const mockUser = {
  name: "Test User",
};

describe("Header component", () => {
  it("ログイン状態でヘッダー表示", () => {
    const props = {
      user: mockUser,
      onLogin: () => {},
      onLogout: () => {},
      onCreateAccount: () => {},
    };
    const result = Header(props);
    expect(result).toBeDefined();
  });

  it("ログアウト状態でヘッダー表示", () => {
    const props = {
      onLogin: () => {},
      onLogout: () => {},
      onCreateAccount: () => {},
    };
    const result = Header(props);
    expect(result).toBeDefined();
  });
});

import React from "react";
import AuthButton from "../../components/header-auth";

jest.mock("../../lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: null } })),
    },
  })),
}));

jest.mock(
  "../../components/my-avatar",
  () => () => React.createElement("div", null, "Avatar"),
);

describe("AuthButton", () => {
  it("未認証時のボタン表示", async () => {
    const authButtonComponent = await AuthButton();
    expect(authButtonComponent.type).toBe("div");
    expect(authButtonComponent.props.className).toContain("flex gap-2");
  });

  it("認証済み時のアバター表示", async () => {
    const mockCreateClient = require("../../lib/supabase/server").createClient;
    mockCreateClient.mockReturnValue({
      auth: {
        getUser: jest.fn(() =>
          Promise.resolve({ data: { user: { id: "test-id" } } }),
        ),
      },
    });
    const authButtonComponent = await AuthButton();
    expect(authButtonComponent.props.children[0].type).toBeDefined();
  });
});

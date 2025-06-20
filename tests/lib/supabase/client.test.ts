import { createClient } from "../../../lib/supabase/client";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: jest.fn() },
    from: jest.fn(),
  })),
}));

describe("createClient", () => {
  it("Supabaseクライアントの正常作成", () => {
    const client = createClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
  });

  it("クライアント機能の確認", () => {
    const client = createClient();
    expect(typeof client.from).toBe("function");
  });
});

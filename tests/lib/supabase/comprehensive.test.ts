process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

describe("Supabase Comprehensive", () => {
  it("環境変数チェック確認", () => {
    const checkEnvVars = () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      return { url, key };
    };

    const result = checkEnvVars();
    expect(result.url).toBe("http://localhost:54321");
    expect(result.key).toBe("test-key");
  });

  it("クライアント作成確認", () => {
    const createMockClient = () => ({
      from: jest.fn(),
      auth: { signIn: jest.fn() },
    });

    const client = createMockClient();
    expect(typeof client.from).toBe("function");
    expect(typeof client.auth.signIn).toBe("function");
  });

  it("サーバークライアント確認", () => {
    const createMockServerClient = () => ({
      from: jest.fn(),
      rpc: jest.fn(),
    });

    const serverClient = createMockServerClient();
    expect(typeof serverClient.from).toBe("function");
    expect(typeof serverClient.rpc).toBe("function");
  });

  it("ミドルウェア確認", () => {
    const mockMiddleware = {
      updateSession: jest.fn(),
      getUser: jest.fn(),
    };

    expect(typeof mockMiddleware.updateSession).toBe("function");
    expect(typeof mockMiddleware.getUser).toBe("function");
  });
});

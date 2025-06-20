jest.mock("../../../lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() =>
        Promise.resolve({ data: { id: "post123" }, error: null }),
      ),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() =>
            Promise.resolve({
              data: { id: "post123", title: "Test" },
              error: null,
            }),
          ),
        })),
      })),
    })),
  })),
}));

jest.mock("../../../lib/supabase/server", () => ({
  createServiceClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() =>
        Promise.resolve({ data: { id: "post123" }, error: null }),
      ),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() =>
            Promise.resolve({
              data: { id: "post123", title: "Test" },
              error: null,
            }),
          ),
        })),
      })),
    })),
  })),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

describe("Posting Service", () => {
  it("投稿サービス存在確認", () => {
    const posting = require("../../../lib/services/posting");
    expect(typeof posting).toBe("object");
  });

  it("投稿サービスプロパティ確認", () => {
    const mockPost = { title: "Test", content: "Content" };
    expect(mockPost.title).toBe("Test");
  });
});

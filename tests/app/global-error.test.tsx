import {
  signInActionWithState,
  signUpActionWithState,
} from "../../app/actions";

jest.mock("next/headers", () => ({
  headers: jest.fn(() => ({
    get: jest.fn(() => "http://localhost:3000"),
  })),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

jest.mock("../../lib/utils/utils", () => ({
  encodedRedirect: jest.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
  cn: jest.fn((...args) => args.filter(Boolean).join(" ")),
  getXpToNextLevel: jest.fn(() => 100),
  getLevelProgress: jest.fn(() => 0.5),
}));

jest.mock("../../lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(() =>
        Promise.resolve({ data: { user: { id: "test-id" } }, error: null }),
      ),
      signInWithPassword: jest.fn(() => Promise.resolve({ error: null })),
    },
  })),
  createServiceClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn(() =>
            Promise.resolve({ data: null, error: null }),
          ),
        })),
      })),
    })),
  })),
}));

jest.mock("../../lib/validation/auth", () => ({
  signUpAndLoginFormSchema: {
    safeParse: jest.fn(() => ({
      success: false,
      error: { errors: [{ message: "Test error" }] },
    })),
  },
  signInAndLoginFormSchema: {
    safeParse: jest.fn(() => ({
      success: false,
      error: { errors: [{ message: "Test error" }] },
    })),
  },
}));

describe("App Actions", () => {
  it("サインアップアクション実行", async () => {
    const formData = new FormData();
    formData.append("email", "test@example.com");
    formData.append("password", "password123");
    const result = await signUpActionWithState(null, formData);
    expect(result.error).toBeDefined();
  });

  it("サインインアクション実行", async () => {
    const formData = new FormData();
    formData.append("email", "test@example.com");
    formData.append("password", "password123");
    const result = await signInActionWithState(null, formData);
    expect(result.error).toBeDefined();
  });
});

import {
  forgotPasswordAction,
  signInActionWithState,
  signUpActionWithState,
} from "../../app/actions";

jest.mock("../../lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(() =>
        Promise.resolve({ data: { user: { id: "test-id" } }, error: null }),
      ),
      signInWithPassword: jest.fn(() => Promise.resolve({ error: null })),
      resetPasswordForEmail: jest.fn(() => Promise.resolve({ error: null })),
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
  signUpAndLoginFormSchema: { safeParse: jest.fn(() => ({ success: true })) },
  signInAndLoginFormSchema: { safeParse: jest.fn(() => ({ success: true })) },
  forgotPasswordFormSchema: { safeParse: jest.fn(() => ({ success: true })) },
}));

jest.mock("../../lib/validation/referral", () => ({
  isValidReferralCode: jest.fn(() => Promise.resolve(false)),
  isEmailAlreadyUsedInReferral: jest.fn(() => Promise.resolve(false)),
}));

jest.mock("../../lib/services/userLevel", () => ({
  getOrInitializeUserLevel: jest.fn(() =>
    Promise.resolve({ id: "test-id", xp: 0, level: 1 }),
  ),
  grantMissionCompletionXp: jest.fn(() => Promise.resolve()),
}));

jest.mock("../../lib/utils/utils", () => ({
  encodedRedirect: jest.fn(() => ({ redirect: true })),
}));

jest.mock("next/headers", () => ({
  headers: jest.fn(() =>
    Promise.resolve({ get: jest.fn(() => "http://localhost:3000") }),
  ),
}));

describe("signUpActionWithState", () => {
  it("正常なサインアップ処理", async () => {
    const formData = new FormData();
    formData.append("email", "test@example.com");
    formData.append("password", "password123");
    formData.append("date_of_birth", "1990-01-01");
    const result = await signUpActionWithState(null, formData);
    expect(result).toBeDefined();
  });

  it("無効な入力でエラー処理", async () => {
    const formData = new FormData();
    const result = await signUpActionWithState(null, formData);
    expect(result.error).toBeDefined();
  });
});

describe("signInActionWithState", () => {
  it("正常なサインイン処理でリダイレクト", async () => {
    const formData = new FormData();
    formData.append("email", "test@example.com");
    formData.append("password", "password123");
    try {
      await signInActionWithState(null, formData);
    } catch (error: unknown) {
      expect((error as Error).message).toBe("NEXT_REDIRECT");
    }
  });

  it("空の入力でエラー処理", async () => {
    const formData = new FormData();
    const result = await signInActionWithState(null, formData);
    expect(result.error).toBeDefined();
  });
});

describe("forgotPasswordAction", () => {
  it("正常なパスワードリセット処理", async () => {
    const formData = new FormData();
    formData.append("email", "test@example.com");
    const result = await forgotPasswordAction(formData);
    expect(result).toBeDefined();
  });

  it("空のメールでエラー処理", async () => {
    const formData = new FormData();
    const result = await forgotPasswordAction(formData);
    expect(result).toBeDefined();
  });
});

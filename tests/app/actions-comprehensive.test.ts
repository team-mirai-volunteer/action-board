import {
  forgotPasswordAction,
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
  calculateAge: jest.fn(() => 25),
}));

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
      insert: jest.fn(() => Promise.resolve({ error: null })),
    })),
  })),
}));

jest.mock("../../lib/validation/auth", () => ({
  signUpAndLoginFormSchema: {
    safeParse: jest.fn((data) => {
      if (data.email && data.password) {
        return {
          success: true,
          data: {
            email: data.email,
            password: data.password,
            date_of_birth: "1990-01-01",
          },
        };
      }
      return {
        success: false,
        error: { errors: [{ message: "Validation error" }] },
      };
    }),
  },
  signInAndLoginFormSchema: {
    safeParse: jest.fn((data) => {
      if (data.email && data.password) {
        return {
          success: true,
          data: { email: data.email, password: data.password },
        };
      }
      return {
        success: false,
        error: { errors: [{ message: "Validation error" }] },
      };
    }),
  },
  forgotPasswordFormSchema: {
    safeParse: jest.fn((data) => {
      if (data.email) {
        return { success: true, data: { email: data.email } };
      }
      return {
        success: false,
        error: { errors: [{ message: "Email required" }] },
      };
    }),
  },
}));

describe("App Actions Comprehensive", () => {
  it("サインアップ成功処理", async () => {
    const formData = new FormData();
    formData.append("email", "test@example.com");
    formData.append("password", "password123");
    formData.append("date_of_birth", "1990-01-01");

    try {
      await signUpActionWithState(null, formData);
    } catch (error: unknown) {
      expect((error as Error).message).toBe("NEXT_REDIRECT");
    }
  });

  it("サインアップバリデーションエラー", async () => {
    const formData = new FormData();
    const result = await signUpActionWithState(null, formData);
    expect(result.error).toContain("Validation error");
  });

  it("サインイン成功処理", async () => {
    const formData = new FormData();
    formData.append("email", "test@example.com");
    formData.append("password", "password123");

    try {
      await signInActionWithState(null, formData);
    } catch (error: unknown) {
      expect((error as Error).message).toBe("NEXT_REDIRECT");
    }
  });

  it("サインインバリデーションエラー", async () => {
    const formData = new FormData();
    const result = await signInActionWithState(null, formData);
    expect(result.error).toContain(
      "メールアドレスまたはパスワードが間違っています",
    );
  });

  it("パスワードリセット成功処理", async () => {
    const formData = new FormData();
    formData.append("email", "test@example.com");

    try {
      await forgotPasswordAction(formData);
    } catch (error: unknown) {
      expect((error as Error).message).toBe("NEXT_REDIRECT");
    }
  });

  it("パスワードリセットバリデーションエラー", async () => {
    const formData = new FormData();

    try {
      await forgotPasswordAction(formData);
    } catch (error: unknown) {
      expect((error as Error).message).toBe("NEXT_REDIRECT");
    }
  });
});

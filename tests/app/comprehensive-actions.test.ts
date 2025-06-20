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
  calculateAge: jest.fn((dateString) => {
    const birthDate = new Date(dateString);
    const today = new Date();
    return today.getFullYear() - birthDate.getFullYear();
  }),
}));

const mockSupabaseClient = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    resetPasswordForEmail: jest.fn(),
  },
};

const mockServiceClient = {
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
};

jest.mock("../../lib/supabase/server", () => ({
  createClient: jest.fn(() => mockSupabaseClient),
  createServiceClient: jest.fn(() => mockServiceClient),
}));

jest.mock("../../lib/validation/auth", () => ({
  signUpAndLoginFormSchema: {
    safeParse: jest.fn((data) => {
      if (data.email && data.password && data.date_of_birth) {
        return { success: true, data };
      }
      return {
        success: false,
        error: { errors: [{ message: "バリデーションエラー" }] },
      };
    }),
  },
  signInAndLoginFormSchema: {
    safeParse: jest.fn((data) => {
      if (data.email && data.password) {
        return { success: true, data };
      }
      return {
        success: false,
        error: { errors: [{ message: "バリデーションエラー" }] },
      };
    }),
  },
  forgotPasswordFormSchema: {
    safeParse: jest.fn((data) => {
      if (data.email) {
        return { success: true, data };
      }
      return {
        success: false,
        error: { errors: [{ message: "メールアドレスが必要です" }] },
      };
    }),
  },
}));

describe("App Actions Comprehensive Coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("signUpActionWithState", () => {
    it("成功時のユーザー作成とプロファイル挿入", async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: { id: "user123" } },
        error: null,
      });

      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");
      formData.append("date_of_birth", "1990-01-01");

      try {
        await signUpActionWithState(null, formData);
      } catch (error: unknown) {
        expect((error as Error).message).toBe("NEXT_REDIRECT");
      }

      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        options: expect.objectContaining({
          data: expect.objectContaining({
            date_of_birth: "1990-01-01",
          }),
          emailRedirectTo: expect.stringContaining("/auth/callback"),
        }),
      });
      expect(mockServiceClient.from).toHaveBeenCalledWith("user_levels");
    });

    it("Supabaseエラー時の処理", async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: "User already registered" },
      });

      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");
      formData.append("date_of_birth", "1990-01-01");

      const result = await signUpActionWithState(null, formData);
      expect(result.error).toContain("ユーザー登録に失敗しました");
    });

    it("年齢計算とプロファイル作成", async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: { id: "user123" } },
        error: null,
      });

      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");
      formData.append("date_of_birth", "2000-01-01");

      try {
        await signUpActionWithState(null, formData);
      } catch (error: unknown) {
        expect((error as Error).message).toBe("NEXT_REDIRECT");
      }

      expect(mockServiceClient.from).toHaveBeenCalledWith("user_levels");
    });
  });

  describe("signInActionWithState", () => {
    it("成功時のサインイン処理", async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        error: null,
      });

      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");

      try {
        await signInActionWithState(null, formData);
      } catch (error: unknown) {
        expect((error as Error).message).toBe("NEXT_REDIRECT");
      }

      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    it("認証エラー時の処理", async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        error: { message: "Invalid login credentials" },
      });

      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "wrongpassword");

      const result = await signInActionWithState(null, formData);
      expect(result.error).toContain(
        "メールアドレスまたはパスワードが間違っています",
      );
    });
  });

  describe("forgotPasswordAction", () => {
    it("成功時のパスワードリセット処理", async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        error: null,
      });

      const formData = new FormData();
      formData.append("email", "test@example.com");

      try {
        await forgotPasswordAction(formData);
      } catch (error: unknown) {
        expect((error as Error).message).toBe("NEXT_REDIRECT");
      }

      expect(
        mockSupabaseClient.auth.resetPasswordForEmail,
      ).toHaveBeenCalledWith(
        "test@example.com",
        expect.objectContaining({
          redirectTo: expect.stringContaining("/reset-password"),
        }),
      );
    });

    it("リセットエラー時の処理", async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        error: { message: "User not found" },
      });

      const formData = new FormData();
      formData.append("email", "nonexistent@example.com");

      try {
        await forgotPasswordAction(formData);
      } catch (error: unknown) {
        expect((error as Error).message).toBe("NEXT_REDIRECT");
      }
    });
  });
});

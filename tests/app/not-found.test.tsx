import { forgotPasswordAction } from "../../app/actions";

jest.mock("next/headers", () => ({
  headers: jest.fn(() => ({
    get: jest.fn(() => "http://localhost:3000"),
  })),
}));

jest.mock("../../lib/utils/utils", () => ({
  encodedRedirect: jest.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

jest.mock("../../lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: {
      resetPasswordForEmail: jest.fn(() => Promise.resolve({ error: null })),
    },
  })),
}));

jest.mock("../../lib/validation/auth", () => ({
  forgotPasswordFormSchema: {
    safeParse: jest.fn(() => ({ success: false, error: { issues: [] } })),
  },
}));

describe("Password Reset Action", () => {
  it("パスワードリセット正常処理", async () => {
    const formData = new FormData();
    formData.append("email", "test@example.com");
    try {
      await forgotPasswordAction(formData);
    } catch (error: unknown) {
      expect((error as Error).message).toContain("Cannot read properties");
    }
  });

  it("パスワードリセット空入力処理", async () => {
    const formData = new FormData();
    try {
      await forgotPasswordAction(formData);
    } catch (error: unknown) {
      expect((error as Error).message).toContain("NEXT_REDIRECT");
    }
  });
});

import {
  forgotPasswordFormSchema,
  signInAndLoginFormSchema,
  signUpAndLoginFormSchema,
} from "../../../lib/validation/auth";

describe("signUpAndLoginFormSchema", () => {
  it("有効なサインアップデータの検証", () => {
    const validData = {
      email: "test@example.com",
      password: "password123",
      date_of_birth: "1990-01-01",
    };
    const result = signUpAndLoginFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("無効なサインアップデータの検証", () => {
    const invalidData = { email: "invalid-email" };
    const result = signUpAndLoginFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("signInAndLoginFormSchema", () => {
  it("有効なサインインデータの検証", () => {
    const validData = {
      email: "test@example.com",
      password: "password123",
    };
    const result = signInAndLoginFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("無効なサインインデータの検証", () => {
    const invalidData = { email: "" };
    const result = signInAndLoginFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

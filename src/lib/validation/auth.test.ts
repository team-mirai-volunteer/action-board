import {
  forgotPasswordFormSchema,
  passwordAlertlessSchema,
  passwordAlertSchema,
  passwordSchema,
  signInAndLoginFormSchema,
  signUpAndLoginFormSchema,
} from "./auth";

describe("auth validation", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-06-15"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("passwordAlertSchema", () => {
    describe("バリデーションエラー", () => {
      test("空文字はエラーになる", () => {
        const result = passwordAlertSchema.safeParse("");
        expect(result.success).toBe(false);
      });

      test("8文字未満はエラーになる", () => {
        const result = passwordAlertSchema.safeParse("abc123");
        expect(result.success).toBe(false);
      });

      test("英字のみはエラーになる", () => {
        const result = passwordAlertSchema.safeParse("abcdefgh");
        expect(result.success).toBe(false);
      });

      test("数字のみはエラーになる", () => {
        const result = passwordAlertSchema.safeParse("12345678");
        expect(result.success).toBe(false);
      });
    });

    describe("バリデーション成功", () => {
      test("英数字混在8文字以上はOK", () => {
        const result = passwordAlertSchema.safeParse("abcd1234");
        expect(result.success).toBe(true);
      });

      test("英数字混在で長いパスワードもOK", () => {
        const result = passwordAlertSchema.safeParse("Password123");
        expect(result.success).toBe(true);
      });
    });
  });

  describe("passwordAlertlessSchema", () => {
    describe("バリデーションエラー", () => {
      test("33文字以上はエラーになる", () => {
        const result = passwordAlertlessSchema.safeParse("a".repeat(33));
        expect(result.success).toBe(false);
      });

      test("スペースを含むとエラーになる", () => {
        const result = passwordAlertlessSchema.safeParse("abc 123");
        expect(result.success).toBe(false);
      });

      test("日本語を含むとエラーになる", () => {
        const result = passwordAlertlessSchema.safeParse("パスワード123");
        expect(result.success).toBe(false);
      });
    });

    describe("バリデーション成功", () => {
      test("許可文字(英数字)はOK", () => {
        const result = passwordAlertlessSchema.safeParse("abcABC123");
        expect(result.success).toBe(true);
      });

      test("許可記号(@+*/#$%&!-)はOK", () => {
        const result = passwordAlertlessSchema.safeParse("@+*/#$%&!-");
        expect(result.success).toBe(true);
      });

      test("32文字ちょうどはOK", () => {
        const result = passwordAlertlessSchema.safeParse("a".repeat(32));
        expect(result.success).toBe(true);
      });

      test("空文字はOK (alertlessでは長さ上限と文字種のみチェック)", () => {
        const result = passwordAlertlessSchema.safeParse("");
        expect(result.success).toBe(true);
      });
    });
  });

  describe("passwordSchema", () => {
    describe("バリデーションエラー", () => {
      test("alertSchemaのみ満たす場合はエラー (33文字以上の英数字)", () => {
        const result = passwordSchema.safeParse("a1".repeat(17));
        expect(result.success).toBe(false);
      });

      test("alertlessSchemaのみ満たす場合はエラー (英字のみ短い文字列)", () => {
        const result = passwordSchema.safeParse("abc");
        expect(result.success).toBe(false);
      });
    });

    describe("バリデーション成功", () => {
      test("両方の条件を満たすパスワードはOK", () => {
        const result = passwordSchema.safeParse("abcd1234");
        expect(result.success).toBe(true);
      });
    });
  });

  describe("signUpAndLoginFormSchema", () => {
    const validInput = {
      email: "test@example.com",
      password: "abcd1234",
      date_of_birth: "2000-01-01",
    };

    describe("バリデーション成功", () => {
      test("正常な入力はOK", () => {
        const result = signUpAndLoginFormSchema.safeParse(validInput);
        expect(result.success).toBe(true);
      });

      test("date_of_birthがISO文字列に変換される", () => {
        const result = signUpAndLoginFormSchema.safeParse(validInput);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.date_of_birth).toBe(
            new Date("2000-01-01").toISOString(),
          );
        }
      });
    });

    describe("バリデーションエラー", () => {
      test("email不正はエラーになる", () => {
        const result = signUpAndLoginFormSchema.safeParse({
          ...validInput,
          email: "invalid-email",
        });
        expect(result.success).toBe(false);
      });

      test("emailが空文字はエラーになる", () => {
        const result = signUpAndLoginFormSchema.safeParse({
          ...validInput,
          email: "",
        });
        expect(result.success).toBe(false);
      });

      test("18歳未満のdate_of_birthはエラーになる", () => {
        const result = signUpAndLoginFormSchema.safeParse({
          ...validInput,
          date_of_birth: "2010-01-01",
        });
        expect(result.success).toBe(false);
      });

      test("ちょうど18歳未満(誕生日前)はエラーになる", () => {
        // 2024-06-15が現在日なので、2006-06-16生まれはまだ17歳
        const result = signUpAndLoginFormSchema.safeParse({
          ...validInput,
          date_of_birth: "2006-06-16",
        });
        expect(result.success).toBe(false);
      });

      test("ちょうど18歳(誕生日当日)はOK", () => {
        // 2024-06-15が現在日なので、2006-06-15生まれはちょうど18歳
        const result = signUpAndLoginFormSchema.safeParse({
          ...validInput,
          date_of_birth: "2006-06-15",
        });
        expect(result.success).toBe(true);
      });

      test("date_of_birthが空文字はエラーになる", () => {
        const result = signUpAndLoginFormSchema.safeParse({
          ...validInput,
          date_of_birth: "",
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe("signInAndLoginFormSchema", () => {
    describe("バリデーション成功", () => {
      test("正常な入力はOK", () => {
        const result = signInAndLoginFormSchema.safeParse({
          email: "test@example.com",
          password: "abcd1234",
        });
        expect(result.success).toBe(true);
      });
    });

    describe("バリデーションエラー", () => {
      test("email不正はエラーになる", () => {
        const result = signInAndLoginFormSchema.safeParse({
          email: "invalid-email",
          password: "abcd1234",
        });
        expect(result.success).toBe(false);
      });

      test("emailが空文字はエラーになる", () => {
        const result = signInAndLoginFormSchema.safeParse({
          email: "",
          password: "abcd1234",
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe("forgotPasswordFormSchema", () => {
    describe("バリデーション成功", () => {
      test("正常なメールアドレスはOK", () => {
        const result = forgotPasswordFormSchema.safeParse({
          email: "test@example.com",
        });
        expect(result.success).toBe(true);
      });
    });

    describe("バリデーションエラー", () => {
      test("空メールはエラーになる", () => {
        const result = forgotPasswordFormSchema.safeParse({
          email: "",
        });
        expect(result.success).toBe(false);
      });

      test("不正なメールアドレスはエラーになる", () => {
        const result = forgotPasswordFormSchema.safeParse({
          email: "not-an-email",
        });
        expect(result.success).toBe(false);
      });
    });
  });
});

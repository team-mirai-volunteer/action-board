import { z } from "zod";
import { calculateAge } from "@/lib/utils/utils";

// パスワードの許可文字の正規表現
const ALLOWED_PASSWORD_CHARS_REGEX = /^[a-zA-Z0-9@+*/#$%&!-]*$/;
// パスワードが英字と数字の両方を含むかチェックする正規表現
const ALPHANUMERIC_REQUIRED_REGEX = /(?=.*[a-zA-Z])(?=.*[0-9])/;

// メールアドレスのバリデーションスキーマ（再利用可能）
const emailSchema = z
  .string()
  .nonempty({ message: "メールアドレスを入力してください" })
  .email({ message: "有効なメールアドレスを入力してください" });

// パスワードのサーバーバリデーションスキーマ（再利用可能）
export const passwordAlertSchema = z
  .string()
  .nonempty({ message: "パスワードを入力してください" })
  .min(8, { message: "パスワードは8文字以上で入力してください" })
  .regex(ALPHANUMERIC_REQUIRED_REGEX, {
    message: "パスワードには英字と数字の両方を含めてください",
  });

// パスワードのクライアントバリデーションスキーマ（再利用可能）
export const passwordAlertlessSchema = z
  .string()
  .max(32, { message: "パスワードは32文字以下で入力してください" })
  .regex(ALLOWED_PASSWORD_CHARS_REGEX, {
    message: "パスワードに無効な文字が含まれています",
  });

// パスワードのバリデーションスキーマ（再利用可能）
export const passwordSchema = passwordAlertlessSchema.and(passwordAlertSchema);

export const signUpAndLoginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  date_of_birth: z
    .string()
    .nonempty({ message: "生年月日を入力してください" })
    .refine(
      (value) => {
        const age = calculateAge(value);
        return age >= 18;
      },
      {
        message: "18歳未満の方は登録できません",
      },
    )
    .transform((value) => new Date(value).toISOString()), // ISO形式に変換
});

export const signInAndLoginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordFormSchema = z.object({
  email: emailSchema,
});

"use server";

import { z } from "zod";
import { getUser } from "@/features/user-profile/services/profile";
import { requestEmailChange } from "@/features/user-settings/services/email";
import { isEmailUser } from "@/lib/utils/auth-utils";

export type ChangeEmailResult = {
  success: boolean;
  error?: string;
  message?: string;
};

const changeEmailFormSchema = z.object({
  newEmail: z
    .string()
    .email({ message: "有効なメールアドレスを入力してください" })
    .min(1, { message: "メールアドレスを入力してください" }),
});

/**
 * メールアドレス変更アクション
 * メールアドレスログインユーザーのみ変更可能
 */
export async function changeEmailAction(
  _previousState: ChangeEmailResult | null,
  formData: FormData,
): Promise<ChangeEmailResult> {
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      error: "ログインが必要です",
    };
  }

  // メールアドレスログインユーザーのチェック
  if (!isEmailUser(user)) {
    return {
      success: false,
      error:
        "メールアドレスログイン以外のアカウントのメールアドレスは変更できません",
    };
  }

  // フォームデータの取得
  const newEmail = formData.get("newEmail")?.toString();

  // バリデーション
  const validatedFields = changeEmailFormSchema.safeParse({
    newEmail,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.errors
        .map((error) => error.message)
        .join("\n"),
    };
  }

  // 現在のメールアドレスと同じかチェック
  if (user.email === validatedFields.data.newEmail) {
    return {
      success: false,
      error: "現在のメールアドレスと同じです",
    };
  }

  // Service層でメールアドレス変更リクエストを送信
  const result = await requestEmailChange(validatedFields.data.newEmail);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    message:
      "確認メールを送信しました。メール内のリンクをクリックして変更を完了してください。",
  };
}

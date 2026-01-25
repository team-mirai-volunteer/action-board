"use server";

import { createClient } from "@/lib/supabase/client";
import { isEmailUser } from "@/lib/utils/auth-utils";
import { z } from "zod";

export type UpdateEmailResult = {
  success: boolean;
  error?: string;
  message?: string;
};

const updateEmailFormSchema = z.object({
  newEmail: z
    .string()
    .email({ message: "有効なメールアドレスを入力してください" })
    .min(1, { message: "メールアドレスを入力してください" }),
});

/**
 * メールアドレス変更アクション
 * LINE連携ユーザーは変更不可
 */
export async function updateEmailAction(
  previousState: UpdateEmailResult | null,
  formData: FormData,
): Promise<UpdateEmailResult> {
  const supabaseClient = createClient();

  // 現在のユーザー情報を取得
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

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
  const validatedFields = updateEmailFormSchema.safeParse({
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

  try {
    // Supabaseでメールアドレスを更新
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const redirectUrl = new URL("/settings/profile?type=email_change", baseUrl);

    const { error } = await supabaseClient.auth.updateUser(
      {
        email: validatedFields.data.newEmail,
      },
      {
        emailRedirectTo: redirectUrl.toString(),
      },
    );

    if (error) {
      // エラーメッセージの詳細化
      if (error.message.includes("already")) {
        return {
          success: false,
          error: "このメールアドレスは既に使用されています",
        };
      }
      console.error("Email update error:", error);
      return {
        success: false,
        error: "メールアドレスの変更に失敗しました",
      };
    }

    return {
      success: true,
      message:
        "確認メールを送信しました。メール内のリンクをクリックして変更を完了してください。",
    };
  } catch (error) {
    console.error("Unexpected error during email update:", error);
    return {
      success: false,
      error: "予期しないエラーが発生しました",
    };
  }
}

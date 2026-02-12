import type { SupabaseClient } from "@supabase/supabase-js";

export type ChangeEmailResult =
  | { success: true }
  | { success: false; error: string };

export type UpdateEmailFn = (
  newEmail: string,
  emailRedirectTo?: string,
) => Promise<{ error: { message: string } | null }>;

/**
 * デフォルトのメール更新関数（ユーザーセッション経由）
 * 本番環境ではメール確認フローが走る
 */
export function createSessionUpdateEmail(
  supabase: SupabaseClient,
): UpdateEmailFn {
  return async (newEmail, emailRedirectTo) => {
    const { error } = await supabase.auth.updateUser(
      { email: newEmail },
      emailRedirectTo ? { emailRedirectTo } : undefined,
    );
    return { error };
  };
}

export async function changeEmail(
  updateEmail: UpdateEmailFn,
  input: {
    currentEmail: string | undefined;
    newEmail: string;
    emailRedirectTo?: string;
  },
): Promise<ChangeEmailResult> {
  // 同一メールチェック
  if (input.currentEmail === input.newEmail) {
    return { success: false, error: "現在のメールアドレスと同じです" };
  }

  // メールアドレスを更新
  const { error } = await updateEmail(input.newEmail, input.emailRedirectTo);

  if (error) {
    if (error.message.includes("already")) {
      return {
        success: false,
        error: "このメールアドレスは既に使用されています",
      };
    }
    return { success: false, error: "メールアドレスの変更に失敗しました" };
  }

  return { success: true };
}

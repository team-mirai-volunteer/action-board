import type { SupabaseClient } from "@supabase/supabase-js";

export type ChangeEmailResult =
  | { success: true }
  | { success: false; error: string };

export async function changeEmail(
  supabase: SupabaseClient,
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

  // メールアドレスを更新（元の services/email.ts と同じ auth.updateUser を使用）
  const { error } = await supabase.auth.updateUser(
    { email: input.newEmail },
    input.emailRedirectTo
      ? { emailRedirectTo: input.emailRedirectTo }
      : undefined,
  );

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

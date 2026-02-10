import { randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getOrInitializeUserLevel } from "@/features/user-level/services/level";
import { parseIdTokenPayload } from "@/lib/utils/jwt-utils";
import type { LineApiClient } from "../types/line-api-client";

export type LineLoginInput = {
  code: string;
  redirectUri: string;
  dateOfBirth?: string;
};

export type LineLoginResult =
  | {
      success: true;
      userId: string;
      email: string;
      isNewUser: boolean;
      tempPassword: string;
    }
  | { success: false; error: string };

export async function lineLogin(
  adminSupabase: SupabaseClient,
  lineApiClient: LineApiClient,
  input: LineLoginInput,
): Promise<LineLoginResult> {
  // 1. LINE APIでトークンと交換
  const tokens = await lineApiClient.exchangeCodeForTokens(
    input.code,
    input.redirectUri,
  );

  // 2. IDトークンからユーザー情報を取得
  if (!tokens.id_token) {
    return { success: false, error: "IDトークンが取得できませんでした" };
  }
  const userInfo = parseIdTokenPayload(tokens.id_token);
  const lineUserId = userInfo.sub as string;
  if (!lineUserId) {
    return { success: false, error: "LINEユーザーIDが取得できませんでした" };
  }

  const email = (userInfo.email as string) || `line-${lineUserId}@line.local`;
  const name = (userInfo.name as string) || "LINEユーザー";
  const image = userInfo.picture as string | undefined;

  // 3. 既存ユーザーチェック
  const { data: userResults, error: userFetchError } = await adminSupabase.rpc(
    "get_user_by_line_id",
    {
      line_user_id: lineUserId,
    },
  );

  if (userFetchError) {
    throw new Error("Failed to check user existence");
  }

  const existingUser = userResults?.[0] || null;
  let userId: string;
  let isNewUser = false;

  if (existingUser) {
    const metadata = existingUser.user_metadata as {
      provider?: string;
      picture?: string;
    };

    if (metadata?.provider === "line") {
      // LINEで作成されたユーザー → ログイン（メタデータ更新）
      userId = existingUser.id;
      await adminSupabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...metadata,
          line_user_id: lineUserId,
          line_linked_at: new Date().toISOString(),
          picture: image || metadata?.picture,
        },
      });
    } else {
      // email+passwordで作成されたユーザー → エラー
      return {
        success: false,
        error: "このメールアドレスは既に登録されています。",
      };
    }
  } else {
    // 新規ユーザー
    if (!input.dateOfBirth) {
      return {
        success: false,
        error:
          "新規ユーザー登録には各種同意と生年月日が必要です。サインアップページから登録してください。",
      };
    }

    const { data: newUser, error: createError } =
      await adminSupabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          sub: "",
          name,
          email,
          provider: "line",
          line_user_id: lineUserId,
          date_of_birth: input.dateOfBirth,
          email_verified: true,
          line_linked_at: new Date().toISOString(),
          phone_verified: false,
          picture: image,
        },
      });

    if (createError || !newUser.user) {
      throw new Error(`Failed to create user: ${createError?.message}`);
    }

    userId = newUser.user.id;
    isNewUser = true;

    // subフィールドを設定
    await adminSupabase.auth.admin.updateUserById(userId, {
      user_metadata: { ...newUser.user.user_metadata, sub: userId },
    });

    // ユーザーレベル初期化
    await getOrInitializeUserLevel(userId);
  }

  // 4. 一時パスワードを設定
  const tempPassword = randomBytes(32).toString("base64");
  const { error: passwordError } =
    await adminSupabase.auth.admin.updateUserById(userId, {
      password: tempPassword,
    });

  if (passwordError) {
    console.error("Failed to set temporary password:", passwordError);
  }

  return { success: true, userId, email, isNewUser, tempPassword };
}

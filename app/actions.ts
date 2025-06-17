"use server";

import { randomBytes } from "node:crypto";
import {
  getOrInitializeUserLevel,
  grantMissionCompletionXp,
} from "@/lib/services/userLevel";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { calculateAge, encodedRedirect } from "@/lib/utils/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  forgotPasswordFormSchema,
  signInAndLoginFormSchema,
  signUpAndLoginFormSchema,
} from "@/lib/validation/auth";

import {
  isEmailAlreadyUsedInReferral,
  isValidReferralCode,
} from "@/lib/validation/referral";

// useActionState用のサインアップアクション
export const signUpActionWithState = async (
  prevState: {
    error?: string;
    success?: string;
    message?: string;
    formData?: {
      email: string;
      password: string;
      date_of_birth: string;
      terms_agreed: boolean;
      privacy_agreed: boolean;
    };
  } | null,
  formData: FormData,
) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const date_of_birth = formData.get("date_of_birth")?.toString();
  const terms_agreed = formData.get("terms_agreed")?.toString();
  const privacy_agreed = formData.get("privacy_agreed")?.toString();

  //クエリストリングからリファラルコードを取得
  const rawReferral = formData.get("ref");
  const referralCode =
    typeof rawReferral === "string" ? rawReferral.trim() : null;

  // フォームデータを保存（エラー時の状態復元用）
  const currentFormData = {
    email: email || "",
    password: password || "",
    date_of_birth: date_of_birth || "",
    terms_agreed: terms_agreed === "true",
    privacy_agreed: privacy_agreed === "true",
  };

  const validatedFields = signUpAndLoginFormSchema.safeParse({
    email,
    password,
    date_of_birth,
  });
  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors
        .map((error) => error.message)
        .join("\n"),
      formData: currentFormData,
    };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return {
      error: "メールアドレスとパスワードが必要です",
      formData: currentFormData,
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        date_of_birth, // 生年月日をユーザーデータに保存。プロフィール作成時に固定で設定される
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  //サインアップ完了後にuserIdを取得
  const userId = data?.user?.id;
  if (!userId) {
    return { error: "ユーザー登録に失敗しました", formData: currentFormData };
  }

  //紹介URLから遷移した場合のみ以下を実行
  if (referralCode) {
    const serviceSupabase = await createServiceClient();
    let shouldInsertReferral = false;
    let referrerUserId: string | null = null;
    let referralMissionId: string | null = null;

    try {
      const [isValid, isDuplicate] = await Promise.all([
        isValidReferralCode(referralCode),
        isEmailAlreadyUsedInReferral(email?.toLowerCase() ?? ""),
      ]);

      if (isValid && !isDuplicate) {
        const { data: mission } = await serviceSupabase
          .from("missions")
          .select("id")
          .eq("required_artifact_type", "REFERRAL")
          .maybeSingle();

        const { data: referrerRecord } = await serviceSupabase
          .from("user_referral")
          .select("user_id")
          .eq("referral_code", referralCode)
          .maybeSingle();

        if (mission && referrerRecord?.user_id) {
          shouldInsertReferral = true;
          referrerUserId = referrerRecord.user_id;
          referralMissionId = mission.id;
        }
      }
    } catch (e) {
      // ログだけ残す（ユーザーには知らせない）
      console.warn("紹介コード処理エラー:", e);
    }

    if (shouldInsertReferral && referrerUserId && referralMissionId) {
      try {
        const { data: achievement, error: achievementError } =
          await serviceSupabase
            .from("achievements")
            .insert({
              user_id: referrerUserId,
              mission_id: referralMissionId,
            })
            .select("id")
            .single();

        if (achievement && !achievementError) {
          await serviceSupabase.from("mission_artifacts").insert({
            user_id: referrerUserId,
            achievement_id: achievement.id,
            artifact_type: "REFERRAL",
            text_content: email.toLowerCase(),
          });
          // ミッション達成時にXPを付与
          await grantMissionCompletionXp(
            referrerUserId,
            referralMissionId,
            achievement.id,
          );
        } else {
          console.warn("achievements挿入エラー:", achievementError);
        }
      } catch (e) {
        console.warn("紹介ミッション登録処理に失敗:", e);
      }
    }
  }

  if (data.user?.id) {
    try {
      await getOrInitializeUserLevel(data.user.id);
    } catch (levelError) {
      console.error("Failed to initialize user level:", levelError);
    }
  }

  // 成功時はリダイレクトする
  return encodedRedirect("success", "/sign-up-success", "登録が完了しました。");
};

// useActionState用のサインインアクション
export const signInActionWithState = async (
  prevState: {
    error?: string;
    success?: string;
    message?: string;
    formData?: {
      email: string;
    };
  } | null,
  formData: FormData,
) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  // フォームデータを保存（エラー時の状態復元用、メールアドレスのみ）
  const currentFormData = {
    email: email || "",
  };

  const validatedFields = signInAndLoginFormSchema.safeParse({
    email,
    password,
  });
  if (!validatedFields.success) {
    return {
      error: "メールアドレスまたはパスワードが間違っています",
      formData: currentFormData,
    };
  }

  if (!email || !password) {
    return {
      error: "メールアドレスまたはパスワードが間違っています",
      formData: currentFormData,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: "メールアドレスまたはパスワードが間違っています",
      formData: currentFormData,
    };
  }

  return redirect("/");
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validatedFields = signInAndLoginFormSchema.safeParse({
    email,
    password,
  });
  if (!validatedFields.success) {
    return encodedRedirect(
      "error",
      "/sign-in",
      "メールアドレスまたはパスワードが間違っています",
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect(
      "error",
      "/sign-in",
      "メールアドレスまたはパスワードが間違っています",
    );
  }

  return redirect("/");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect(
      "error",
      "/forgot-password",
      "メールアドレスが必要です",
    );
  }

  const validatedFields = forgotPasswordFormSchema.safeParse({ email });
  if (!validatedFields.success) {
    return encodedRedirect(
      "error",
      "/forgot-password",
      validatedFields.error.errors.map((error) => error.message).join("\n"),
    );
  }

  // LINEユーザーかどうかを確認
  const serviceSupabase = await createServiceClient();
  const { data: existingUsers } = await serviceSupabase.auth.admin.listUsers();
  const userWithEmail = existingUsers.users.find((u) => u.email === email);

  // LINEユーザーの場合、パスワードリセットは出来ない
  if (userWithEmail && userWithEmail.user_metadata?.provider === "line") {
    return encodedRedirect(
      "error",
      "/forgot-password",
      "パスワードリセットに失敗しました",
    );
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "パスワードリセットに失敗しました",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "パスワードリセット用のリンクをメールでお送りしました。",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/reset-password",
      "パスワードとパスワード確認が必要です",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect("error", "/reset-password", "パスワードが一致しません");
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/reset-password",
      error.code === "same_password"
        ? "新しいパスワードは現在のパスワードと異なるものを設定してください"
        : "パスワードの更新に失敗しました",
    );
  }

  encodedRedirect("success", "/reset-password", "パスワードを更新しました");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

// Email + Password専用サインアップアクション（Two-Step Signup用）
export const emailSignUpActionWithState = async (
  prevState: {
    error?: string;
    success?: string;
    message?: string;
    formData?: {
      email: string;
      password: string;
    };
  } | null,
  formData: FormData,
) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const dateOfBirth = formData.get("date_of_birth")?.toString();
  const referralCode = formData.get("ref")?.toString();

  // フォームデータを保存（エラー時の状態復元用）
  const currentFormData = {
    email: email || "",
    password: "",
  };

  if (!dateOfBirth) {
    return {
      error: "セッション情報が見つかりません。最初からやり直してください。",
      formData: currentFormData,
    };
  }

  // サーバーサイドで年齢チェック（LINEログインと同様）
  const age = calculateAge(dateOfBirth);
  if (age < 18) {
    const yearsToWait = 18 - age;
    const waitText = yearsToWait > 1 ? `あと${yearsToWait}年で` : "もうすぐ";
    return {
      error: `18歳以上の方のみご登録いただけます。${waitText}登録できますので、その日を楽しみにお待ちください！`,
      formData: currentFormData,
    };
  }

  // 新しいFormDataを作成して、既存のsignUpActionWithStateを呼び出し
  const newFormData = new FormData();
  newFormData.set("email", email || "");
  newFormData.set("password", password || "");
  newFormData.set("date_of_birth", dateOfBirth);
  newFormData.set("terms_agreed", "true"); // 事前に同意済み
  newFormData.set("privacy_agreed", "true"); // 事前に同意済み
  if (referralCode) {
    newFormData.set("ref", referralCode);
  }

  return signUpActionWithState(null, newFormData);
};

// LINE認証用のバリデーションスキーマ
const lineAuthSchema = z.object({
  code: z.string().nonempty({ message: "Authorization code is required" }),
  dateOfBirth: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value) return true; // 新規ユーザーでない場合はオプショナル
        const age = calculateAge(value);
        return age >= 18;
      },
      {
        message: "18歳未満の方は登録できません",
      },
    ),
  referralCode: z.string().optional().nullable(),
});

// LINE認証処理のServer Action
export async function handleLineAuthAction(
  code: string,
  dateOfBirth?: string,
  referralCode?: string | null,
): Promise<
  { success: true; redirectTo: string } | { success: false; error: string }
> {
  try {
    // バリデーション
    const validationResult = lineAuthSchema.safeParse({
      code,
      dateOfBirth,
      referralCode,
    });

    if (!validationResult.success) {
      return {
        success: false,
        error: "認証データが無効です",
      };
    }

    const {
      code: validatedCode,
      dateOfBirth: validatedDateOfBirth,
      referralCode: validatedReferralCode,
    } = validationResult.data;

    // 1. LINE APIでトークンと交換
    const clientId = process.env.NEXT_PUBLIC_LINE_CLIENT_ID;
    const clientSecret = process.env.LINE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("LINE認証の環境変数が設定されていません");
    }

    const origin = (await headers()).get("origin");
    const redirectUri = `${origin || "http://localhost:3000"}/api/auth/callback/line`;
    const tokenParams = {
      grant_type: "authorization_code",
      code: validatedCode,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    };

    const tokenResponse = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(tokenParams),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      throw new Error(
        `Failed to get access token: ${tokenResponse.status} ${errorBody}`,
      );
    }

    const tokens = await tokenResponse.json();

    // 2. IDトークンからユーザー情報を取得
    let userInfo: {
      sub?: string;
      name?: string;
      email?: string;
      picture?: string;
    } = {};

    if (tokens.id_token) {
      const base64Payload = tokens.id_token.split(".")[1];
      const payload = JSON.parse(
        Buffer.from(base64Payload, "base64").toString(),
      );
      userInfo = payload;
    }

    if (!userInfo.sub) {
      throw new Error("Failed to get user information");
    }

    // 3. Supabaseでユーザー処理
    const supabase = await createServiceClient();
    const lineUserId = userInfo.sub;
    const email = userInfo.email || `line-${lineUserId}@line.local`;
    const name = userInfo.name || "LINEユーザー";
    const image = userInfo.picture;

    // 4. 既存ユーザーチェック
    let userId: string;
    let isNewUser = false;

    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userWithEmail = existingUser.users.find((u) => u.email === email);

    if (userWithEmail) {
      // 既存ユーザーの場合：作成方法に応じて処理を分岐
      const userProvider = userWithEmail.user_metadata?.provider;

      if (userProvider === "line") {
        // LINEで作成されたユーザーの場合：ログイン処理
        userId = userWithEmail.id;
        isNewUser = false;

        // LINE関連のメタデータを更新
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            ...userWithEmail.user_metadata,
            line_user_id: lineUserId,
            line_linked_at: new Date().toISOString(),
            picture: image || userWithEmail.user_metadata?.picture,
          },
        });
      } else {
        // email+passwordで作成されたユーザーの場合：エラーを返す
        return {
          success: false,
          error: "このメールアドレスは既に登録されています。",
        };
      }
    } else {
      // 新規ユーザーの場合：登録処理

      // 新規ユーザーの場合、date_of_birthが必要
      if (!validatedDateOfBirth) {
        return {
          success: false,
          error:
            "新規ユーザー登録には各種同意と生年月日が必要です。サインアップページから登録してください。",
        };
      }

      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            sub: "",
            name,
            email,
            provider: "line",
            line_user_id: lineUserId,
            date_of_birth: validatedDateOfBirth,
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

      // subフィールドを正しく設定
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...newUser.user.user_metadata,
          sub: userId,
        },
      });

      // ユーザーレベル初期化（新規ユーザーのみ）
      await getOrInitializeUserLevel(userId);

      // 紹介コード処理（新規ユーザーのみ）
      if (validatedReferralCode && email) {
        await handleReferralCode(validatedReferralCode, email);
      }
    }

    // 5. 一時パスワードを設定
    const tempPassword = randomBytes(32).toString("base64");

    const { error: passwordError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        password: tempPassword,
      },
    );

    if (passwordError) {
      console.error("Failed to set temporary password:", passwordError);
      // パスワード設定に失敗した場合でも続行しますが、ログに記録します
    }

    // 6. Supabaseセッション作成
    const clientSupabase = await createClient();
    const { error: signInError } = await clientSupabase.auth.signInWithPassword(
      {
        email,
        password: tempPassword,
      },
    );

    if (signInError) {
      throw new Error("Supabaseログインに失敗しました");
    }

    // 7. リダイレクト先を返す
    if (isNewUser) {
      return {
        success: true,
        redirectTo: "/settings/profile?new=true",
      };
    }
    return {
      success: true,
      redirectTo: "/?login=success",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "ログイン処理に失敗しました",
    };
  }
}

// 紹介コード処理
async function handleReferralCode(referralCode: string, email: string) {
  const serviceSupabase = await createServiceClient();

  try {
    // 紹介コードの検証
    const [isValid, isDuplicate] = await Promise.all([
      isValidReferralCode(referralCode),
      isEmailAlreadyUsedInReferral(email?.toLowerCase() ?? ""),
    ]);

    if (isValid && !isDuplicate) {
      const { data: mission } = await serviceSupabase
        .from("missions")
        .select("id")
        .eq("required_artifact_type", "REFERRAL")
        .maybeSingle();

      const { data: referrerRecord } = await serviceSupabase
        .from("user_referral")
        .select("user_id")
        .eq("referral_code", referralCode)
        .maybeSingle();

      if (mission && referrerRecord?.user_id) {
        const { data: achievement, error: achievementError } =
          await serviceSupabase
            .from("achievements")
            .insert({
              user_id: referrerRecord.user_id,
              mission_id: mission.id,
            })
            .select("id")
            .single();

        if (achievement && !achievementError) {
          await serviceSupabase.from("mission_artifacts").insert({
            user_id: referrerRecord.user_id,
            achievement_id: achievement.id,
            artifact_type: "REFERRAL",
            text_content: email.toLowerCase(),
          });

          // XP付与
          await grantMissionCompletionXp(
            referrerRecord.user_id,
            mission.id,
            achievement.id,
          );
        }
      }
    }
  } catch (error) {
    console.warn("紹介コード処理エラー:", error);
  }
}

"use server";

import { createClient } from "@/lib/supabase/client";
import { encodedRedirect } from "@/lib/utils/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

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
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const date_of_birth = formData.get("date_of_birth") as string;
  const terms_agreed = formData.get("terms_agreed") === "true";
  const privacy_agreed = formData.get("privacy_agreed") === "true";
  const referralCode = formData.get("ref") as string | null;

  const supabase = createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return {
      error: "メールアドレスとパスワードが必要です",
      formData: {
        email: email || "",
        password: "",
        date_of_birth: date_of_birth || "",
        terms_agreed,
        privacy_agreed,
      },
    };
  }

  if (!date_of_birth) {
    return {
      error: "生年月日が必要です",
      formData: {
        email,
        password: "",
        date_of_birth: "",
        terms_agreed,
        privacy_agreed,
      },
    };
  }

  if (!terms_agreed || !privacy_agreed) {
    return {
      error: "利用規約とプライバシーポリシーへの同意が必要です",
      formData: {
        email,
        password: "",
        date_of_birth,
        terms_agreed,
        privacy_agreed,
      },
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        date_of_birth: date_of_birth,
        referred_by_code: referralCode || null,
      },
    },
  });

  if (error) {
    console.error(`${error.code} ${error.message}`);
    let errorMessage = "サインアップ中にエラーが発生しました";

    if (error.message.includes("already registered")) {
      errorMessage = "このメールアドレスはすでに登録されています";
    } else if (error.message.includes("weak")) {
      errorMessage = "パスワードは8文字以上で設定してください";
    } else if (error.message.includes("invalid")) {
      errorMessage = "有効なメールアドレスを入力してください";
    }

    return {
      error: errorMessage,
      formData: {
        email,
        password: "",
        date_of_birth,
        terms_agreed,
        privacy_agreed,
      },
    };
  }

  return {
    success: "確認メールを送信しました。メールをご確認ください。",
    redirectUrl: "/sign-up-success",
  };
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
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const returnUrl = formData.get("returnUrl") as string | null;

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: "login-error",
      formData: {
        email,
      },
    };
  }

  const redirectUrl = returnUrl || "/";
  return {
    success: true,
    redirectUrl,
  };
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect(
      "error",
      "/forgot-password",
      "メールアドレスが必要です",
    );
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/reset-password${
      callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""
    }`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "パスワードリセットメールの送信に失敗しました",
    );
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "パスワードリセットメールを送信しました",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = createClient();

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
      "パスワードのアップデートに失敗しました",
    );
  }

  encodedRedirect("success", "/forgot-password", "password-reset-success");
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
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;
  const dateOfBirth = formData.get("dateOfBirth") as string;
  const referralCode = formData.get("referralCode") as string | null;

  if (!email || !password || !dateOfBirth) {
    return {
      error: "必須項目をすべて入力してください",
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

// EmailSignUp用のアクション
export const emailSignUpAction = async (formData: FormData) => {
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;
  const dateOfBirth = formData.get("dateOfBirth") as string;
  const referralCode = formData.get("referralCode") as string | null;

  if (!email || !password || !dateOfBirth) {
    return {
      error: "必須項目をすべて入力してください",
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
        if (!value) return true;
        const date = new Date(value);
        return !Number.isNaN(date.getTime());
      },
      { message: "Invalid date format" },
    ),
  prefecture: z.string().optional(),
  nickname: z.string().optional(),
});

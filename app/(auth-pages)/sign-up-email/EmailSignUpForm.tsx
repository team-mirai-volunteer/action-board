"use client";

import { emailSignUpActionWithState } from "@/app/actions";
import { FormMessage, type Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { passwordAlertlessSchema } from "@/lib/validation/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useCallback, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

interface EmailSignUpFormProps {
  searchParams: Message;
  referralCode: string | null;
}

function EmailSignUpFormContent({
  email,
  password,
  setEmail,
  setPassword,
  passwordError,
}: {
  email: string;
  password: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  passwordError: string | null;
}) {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
      <Label htmlFor="email">メールアドレス</Label>
      <Input
        name="email"
        placeholder="you@example.com"
        required
        disabled={pending}
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Label htmlFor="password">パスワード</Label>
      <p className="text-xs text-muted-foreground mb-2">
        ※8文字以上で半角英数を含めてください。英数と一部記号が使えます。
      </p>
      <Input
        type="password"
        name="password"
        placeholder="パスワード"
        minLength={8}
        required
        disabled={pending}
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {passwordError && (
        <p className="text-primary text-sm font-medium mb-2">{passwordError}</p>
      )}

      <SubmitButton
        pendingText="アカウント作成中..."
        disabled={!email || !password || pending}
        className="mt-4"
      >
        アカウントを作成
      </SubmitButton>
    </div>
  );
}

export default function EmailSignUpForm({
  searchParams,
  referralCode,
}: EmailSignUpFormProps) {
  const router = useRouter();

  // useActionStateを使用してフォームの状態とメッセージを管理
  const [state, formAction] = useActionState(emailSignUpActionWithState, null);

  // フォームの状態管理
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<{
    dateOfBirth?: string;
    referralCode?: string;
  }>({});

  // sessionStorageからデータを取得
  useEffect(() => {
    const storedData = sessionStorage.getItem("signupData");
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setSessionData(parsed);
    } else {
      // sessionStorageにデータがない場合は /sign-up にリダイレクト
      router.push("/sign-up");
    }
  }, [router]);

  // パスワードチェック関数
  const verifyPassword = useCallback((password: string): boolean => {
    if (!password) {
      setPasswordError(null);
      return false;
    }
    const result = passwordAlertlessSchema.safeParse(password);
    if (!result.success) {
      setPasswordError(result.error.errors[0].message);
      return false;
    }
    setPasswordError(null);
    return true;
  }, []);

  // パスワードチェック
  useEffect(() => {
    verifyPassword(password);
  }, [password, verifyPassword]);

  // サーバーから返されたフォームデータで状態を復元
  useEffect(() => {
    if (state?.formData) {
      setEmail(state.formData.email);
    }
  }, [state]);

  return (
    <form
      action={formAction}
      className="flex flex-col min-w-72 max-w-72 mx-auto"
    >
      {/* sessionStorageからのデータをhidden inputで送信 */}
      <input
        type="hidden"
        name="date_of_birth"
        value={sessionData.dateOfBirth || ""}
      />
      <input
        type="hidden"
        name="ref"
        value={sessionData.referralCode || referralCode || ""}
      />

      <h1 className="text-2xl font-medium text-center mb-2">
        メールアドレスとパスワードを入力
      </h1>
      <p className="text-sm text-foreground text-center">
        <Link className="text-primary font-medium underline" href="/sign-up">
          他の方法でアカウント作成
        </Link>
      </p>

      {/* サーバーアクションからのメッセージを表示 */}
      {state && <FormMessage className="mt-8" message={state} />}

      {/* 元のsearchParamsからのメッセージも表示（後方互換性のため） */}
      <FormMessage className="mt-8" message={searchParams} />

      <EmailSignUpFormContent
        email={email}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        passwordError={passwordError}
      />
    </form>
  );
}

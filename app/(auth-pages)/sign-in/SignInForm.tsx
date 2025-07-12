"use client";

import { signInActionWithState } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithLine } from "@/lib/auth/line-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

interface SignInFormProps {
  returnUrl?: string;
}

export default function SignInForm({ returnUrl }: SignInFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(signInActionWithState, null);
  const [isLineLoading, setIsLineLoading] = useState(false);

  // 成功時のリダイレクト処理
  useEffect(() => {
    if (state?.success && state?.redirectUrl) {
      router.push(state.redirectUrl);
    }
  }, [state, router]);

  const handleLINELogin = async () => {
    try {
      setIsLineLoading(true);
      await signInWithLine(returnUrl);
    } catch (error) {
      setIsLineLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-8 min-w-72 max-w-72 mx-auto">
      {/* LINEログインボタン */}
      <Button
        type="button"
        onClick={handleLINELogin}
        disabled={isLineLoading}
        className="w-full h-12 bg-[#00B900] hover:bg-[#00A000] text-white"
      >
        {isLineLoading ? "LINE連携中..." : "LINEでログイン"}
      </Button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            または
          </span>
        </div>
      </div>

      {/* Email + Passwordログインフォーム */}
      <form action={formAction} className="flex flex-col gap-2 [&>input]:mb-3">
        {state?.error && (
          <FormMessage
            message={
              state.error === "login-error"
                ? { type: "login-error" }
                : { error: state.error }
            }
            className="mb-4"
          />
        )}
        {returnUrl && (
          <input type="hidden" name="returnUrl" value={returnUrl} />
        )}

        <Label htmlFor="email">メールアドレス</Label>
        <Input
          name="email"
          placeholder="you@example.com"
          required
          autoComplete="username"
          defaultValue={state?.formData?.email || ""}
        />

        <div className="flex justify-between items-center">
          <Label htmlFor="password">パスワード</Label>
          <Link
            className="text-xs text-foreground underline"
            href="/forgot-password"
          >
            パスワードを忘れた方
          </Link>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="パスワード"
          required
          autoComplete="current-password"
        />

        <SubmitButton pendingText="ログイン中...">ログイン</SubmitButton>
      </form>
    </div>
  );
}

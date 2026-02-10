"use client";

import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { FormMessage } from "@/components/common/form-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { EmailChangeDialog } from "@/features/user-settings/components/email-change-dialog";
import { getAuthMethodDisplayName } from "@/lib/utils/auth-utils";

interface LoginSectionProps {
  user: User;
  isEmailChangeSuccessful?: boolean;
}

export function LoginSection({
  user,
  isEmailChangeSuccessful,
}: LoginSectionProps) {
  const currentEmail = user.email;
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>ログイン設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Label htmlFor="login-method">ログイン方法</Label>
        <p className="text-sm text-gray-500">
          {getAuthMethodDisplayName(user)}
        </p>
        <Label htmlFor="email">メールアドレス</Label>
        <p className="text-sm text-gray-500">
          {!currentEmail || currentEmail?.endsWith("@line.local")
            ? "メールアドレスが登録されていないため、表示できません"
            : currentEmail}
        </p>
        {isEmailChangeSuccessful && (
          <FormMessage
            message={{
              success: "メールアドレスを変更しました。",
            }}
          />
        )}

        <EmailChangeDialog open={open} onOpenChange={setOpen} />
      </CardContent>
    </Card>
  );
}

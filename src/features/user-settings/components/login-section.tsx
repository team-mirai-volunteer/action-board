"use client";

import { FormMessage } from "@/components/common/form-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {} from "@/features/user-settings/actions/change-email-actions";
import { EmailChangeDialog } from "@/features/user-settings/components/email-change-dialog";
import {
  isEmailUser as checkIsEmailUser,
  getAuthMethodDisplayName,
} from "@/lib/utils/auth-utils";
import type { User } from "@supabase/supabase-js";
import { useState } from "react";

interface LoginSectionProps {
  user: User;
  isEmailChangeSuccessful?: boolean;
}

export function LoginSection({
  user,
  isEmailChangeSuccessful,
}: LoginSectionProps) {
  const currentEmail = user.email;
  const isEmailUser = checkIsEmailUser(user);
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>ログイン設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Label htmlFor="name">ログイン方法</Label>
        <p className="text-sm text-gray-500">
          {getAuthMethodDisplayName(user)}
        </p>
        <Label htmlFor="name">メールアドレス</Label>
        <p className="text-sm text-gray-500">
          {!currentEmail || currentEmail?.endsWith("@line.local")
            ? "メールアドレスが登録されていないため、表示できません"
            : currentEmail}
        </p>
        {isEmailChangeSuccessful && (
          <FormMessage
            message={{
              success:
                "メールアドレスを変更しました。新しいメールアドレスでログインできます。",
            }}
          />
        )}

        {isEmailUser ? (
          <EmailChangeDialog open={open} onOpenChange={setOpen} />
        ) : (
          <p className="text-sm text-gray-500">
            ※
            メールアドレスログイン以外のアカウントのメールアドレスは変更できません。
          </p>
        )}
      </CardContent>
    </Card>
  );
}

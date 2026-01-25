"use client";

import { FormMessage } from "@/components/common/form-message";
import { SubmitButton } from "@/components/common/submit-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState, useEffect } from "react";
import {
  type ChangeEmailResult,
  changeEmailAction,
} from "../actions/change-email-actions";

interface EmailChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmailChangeDialog({
  open,
  onOpenChange,
}: EmailChangeDialogProps) {
  const [state, formAction, isPending] = useActionState<
    ChangeEmailResult | null,
    FormData
  >(changeEmailAction, null);

  // 成功時にモーダルを閉じる
  useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
    }
  }, [state?.success, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          メールアドレスを変更する
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>メールアドレスの変更</DialogTitle>
            <DialogDescription>
              新しいメールアドレスに確認メールが送信されます
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newEmail">新しいメールアドレス</Label>
              <Input
                id="newEmail"
                name="newEmail"
                type="email"
                placeholder="new@example.com"
                required
                disabled={isPending}
                autoComplete="email"
              />
            </div>
            {state?.error && <FormMessage message={{ error: state.error }} />}

            <div className="space-y-2 text-sm text-gray-600">
              <p>
                ※
                ボタンを押した後、新しいメールアドレスに確認メールが送信されます。メール内のリンクをクリックして変更を完了してください。
              </p>
              <p>
                ※ 確認が完了するまで、現在のメールアドレスでログインできます。
              </p>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <SubmitButton disabled={isPending} className="w-full">
              確認メールを送信
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

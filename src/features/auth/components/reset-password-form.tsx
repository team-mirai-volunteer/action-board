import { FormMessage, type Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction } from "@/features/auth/actions/auth-actions";

interface ResetPasswordFormProps {
  message?: Message;
}

export function ResetPasswordForm({ message }: ResetPasswordFormProps) {
  return (
    <>
      <Label htmlFor="password">新しいパスワード</Label>
      <Input
        type="password"
        name="password"
        placeholder="新しいパスワード"
        required
        autoComplete="new-password"
      />
      <Label htmlFor="confirmPassword">パスワード確認</Label>
      <Input
        type="password"
        name="confirmPassword"
        placeholder="パスワード確認"
        required
        autoComplete="new-password"
      />
      <SubmitButton formAction={resetPasswordAction}>
        パスワードをリセット
      </SubmitButton>
      <FormMessage message={message} />
    </>
  );
}

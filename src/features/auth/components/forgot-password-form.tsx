import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, type Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ForgotPasswordFormProps {
  message?: Message | null;
}

export function ForgotPasswordForm({ message }: ForgotPasswordFormProps) {
  return (
    <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
      <Label htmlFor="email">メールアドレス</Label>
      <Input
        name="email"
        placeholder="you@example.com"
        required
        autoComplete="username"
      />
      <SubmitButton formAction={forgotPasswordAction}>
        パスワードリセットメールを送信
      </SubmitButton>
      {message && <FormMessage message={message} />}
    </div>
  );
}

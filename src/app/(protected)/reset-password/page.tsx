import { resetPasswordAction } from "@/app/actions";
import { FormMessage, type Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <form className="flex flex-col w-full max-w-md p-4 gap-2 [&>input]:mb-4">
      <h1 className="text-2xl font-medium">パスワードリセット</h1>
      <p className="text-sm text-foreground/60">
        新しいパスワードを入力してください。
      </p>
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
      <FormMessage message={searchParams} />
    </form>
  );
}

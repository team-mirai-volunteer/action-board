import type { Message } from "@/components/common/form-message";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

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
      <ResetPasswordForm message={searchParams} />
    </form>
  );
}

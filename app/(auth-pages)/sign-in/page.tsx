import { FormMessage, type Message } from "@/components/form-message";
import Image from "next/image";
import Link from "next/link";
import SignInForm from "./SignInForm";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    success?: string;
    message?: string;
    returnUrl?: string;
  }>;
}) {
  const params = await searchParams;
  const message: Message | undefined = params.error
    ? { error: params.error }
    : params.success
      ? { success: params.success }
      : params.message
        ? { message: params.message }
        : undefined;

  return (
    <div className="flex-1 flex flex-col min-w-72">
      <div className="flex justify-center items-center m-4">
        <Image src="/img/logo.png" alt="logo" width={114} height={96} />
      </div>
      <h1 className="text-2xl font-medium text-center mb-2">ログイン</h1>
      <p className="text-sm text-foreground text-center">
        まだ登録していない方は{" "}
        <Link className="text-foreground font-medium underline" href="/sign-up">
          こちら
        </Link>
      </p>
      {message && <FormMessage className="mt-8" message={message} />}
      <SignInForm returnUrl={params.returnUrl} />
    </div>
  );
}

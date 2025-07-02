import { FormMessage, type Message } from "@/components/form-message";
import Image from "next/image";
import Link from "next/link";
import SignInForm from "./SignInForm";

type SearchParams = {
  error?: string;
  success?: string;
  message?: string;
  returnUrl?: string;
};

export default async function Login(props: {
  searchParams: Promise<SearchParams>;
}) {
  let searchParams: SearchParams | undefined;
  let message: Message | null = null;
  let returnUrl: string | undefined;

  try {
    searchParams = await props.searchParams;
    returnUrl = searchParams?.returnUrl;

    if (searchParams?.error) {
      message = { error: searchParams.error };
    } else if (searchParams?.success) {
      message = { success: searchParams.success };
    } else if (searchParams?.message) {
      message = { message: searchParams.message };
    }
  } catch (error) {
    console.error("Error parsing search params:", error);
    message = { error: "エラーが発生しました" };
  }

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
      <SignInForm returnUrl={returnUrl} />
    </div>
  );
}

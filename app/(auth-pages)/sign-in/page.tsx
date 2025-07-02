import { FormMessage, type Message } from "@/components/form-message";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import SignInForm from "./SignInForm";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
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
      <FormMessage className="mt-8" message={searchParams} />
      <Suspense
        fallback={
          <div className="flex flex-col gap-4 mt-8 min-w-72 max-w-72 mx-auto">
            読み込み中...
          </div>
        }
      >
        <SignInForm />
      </Suspense>
    </div>
  );
}

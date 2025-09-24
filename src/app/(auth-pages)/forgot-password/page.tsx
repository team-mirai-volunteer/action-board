import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import Image from "next/image";

export default async function ForgotPassword(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  // Type-based message handling
  const getMessage = () => {
    if (searchParams?.success === "password-reset-success") {
      return { type: "password-reset-success" as const };
    }
    if (searchParams?.error && typeof searchParams.error === "string") {
      return { error: searchParams.error };
    }
    if (searchParams?.success && typeof searchParams.success === "string") {
      return { success: searchParams.success };
    }
    if (searchParams?.message && typeof searchParams.message === "string") {
      return { message: searchParams.message };
    }
    return null;
  };

  const message = getMessage();
  return (
    <>
      <form className="flex-1 flex flex-col w-full gap-2 text-foreground [&>input]:mb-6 min-w-72 max-w-72 mx-auto">
        <div className="flex justify-center items-center m-4">
          <Image src="/img/logo_shiro.png" alt="logo" width={114} height={96} />
        </div>
        <h1 className="text-2xl font-medium">パスワードを忘れた方</h1>
        <ForgotPasswordForm message={message} />
      </form>
    </>
  );
}

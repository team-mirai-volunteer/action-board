import type { Message } from "@/components/form-message";
import Image from "next/image";
import EmailSignUpForm from "./EmailSignUpForm";

export default async function EmailSignup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="flex-1 flex flex-col min-w-72">
      <div className="flex justify-center items-center m-4">
        <Image src="/img/logo_shiro.png" alt="logo" width={114} height={96} />
      </div>
      <EmailSignUpForm searchParams={searchParams} />
    </div>
  );
}

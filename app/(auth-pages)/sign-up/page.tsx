import type { Message } from "@/components/form-message";
import Image from "next/image";
import TwoStepSignUpForm from "./TwoStepSignUpForm";

export default async function Signup(props: {
  searchParams: Promise<Message & { ref?: string }>;
}) {
  const searchParams = await props.searchParams;
  const referralCode = searchParams.ref ?? null;

  return (
    <div className="flex-1 flex flex-col min-w-72">
      <div className="flex justify-center items-center m-4">
        <Image src="/img/logo.png" alt="logo" width={114} height={96} />
      </div>
      <TwoStepSignUpForm
        searchParams={searchParams}
        referralCode={referralCode}
      />
    </div>
  );
}

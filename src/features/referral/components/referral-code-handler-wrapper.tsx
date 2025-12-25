"use client";
import { useSearchParams } from "next/navigation";
import { ReferralCodeHandler } from "./referral-code-handler";

export function ReferralCodeHandlerWrapper() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref");
  if (!referralCode) return null;
  return <ReferralCodeHandler referralCode={referralCode} />;
}

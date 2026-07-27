"use client";
import { useSearchParams } from "next/navigation";
import { CampaignCodeHandler } from "./campaign-code-handler";

export function CampaignCodeHandlerWrapper() {
  const searchParams = useSearchParams();
  const campaignCode = searchParams.get("cv");
  if (!campaignCode) return null;
  return <CampaignCodeHandler campaignCode={campaignCode} />;
}

"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

type Props = {
  referralUrl: string;
};

export function CopyReferralButton({ referralUrl }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button onClick={handleCopy} className="mt-4" variant="outline">
      {copied ? "コピーしました！" : "紹介URLをコピー"}
    </Button>
  );
}

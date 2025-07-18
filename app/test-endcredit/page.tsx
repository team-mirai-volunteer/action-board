"use client";

import EndCredit from "@/components/EndCredit";

export default function TestEndCreditPage() {
  return (
    <EndCredit
      onAnimationEnd={() => {
        console.log("End credit animation completed");
      }}
    />
  );
}

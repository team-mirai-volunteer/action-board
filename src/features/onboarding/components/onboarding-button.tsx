"use client";

import { Button } from "@/components/ui/button";
import type { OnboardingButtonProps } from "@/features/onboarding/types/types";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { OnboardingModal } from "./onboarding-modal";

export function OnboardingButton({
  children = "使い方を見る",
  variant = "outline",
  className,
}: OnboardingButtonProps) {
  const [showModal, setShowModal] = useState(false);

  if (variant === "link") {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className={className}
        >
          {children}
        </button>
        <OnboardingModal open={showModal} onOpenChange={setShowModal} />
      </>
    );
  }

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className={className || "gap-2 bg-white shadow-md hover:shadow-lg"}
        variant={variant}
      >
        {variant === "outline" && <Sparkles className="h-4 w-4" />}
        {children}
      </Button>
      <OnboardingModal open={showModal} onOpenChange={setShowModal} />
    </>
  );
}

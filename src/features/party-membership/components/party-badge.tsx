import Image from "next/image";

import { cn } from "@/lib/utils/styles";
import { getPartyPlanConfig } from "../constants/plans";
import type { PartyPlan } from "../types";

type PartyBadgeProps = {
  plan: PartyPlan;
  size?: number;
  className?: string;
  showLabel?: boolean;
};

export function PartyBadge({
  plan,
  size = 20,
  className,
  showLabel = false,
}: PartyBadgeProps) {
  const { label, imageSrc } = getPartyPlanConfig(plan);

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <Image
        src={imageSrc}
        alt={`${label}バッジ`}
        width={size}
        height={size}
        priority={false}
      />
      {showLabel ? (
        <span className="text-xs text-gray-600">{label}</span>
      ) : null}
    </span>
  );
}

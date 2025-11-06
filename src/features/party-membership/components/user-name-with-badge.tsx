"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils/styles";
import {
  PARTY_MEMBERSHIP_CTA_URL,
  getPartyPlanConfig,
} from "../constants/plans";
import type { PartyMembership } from "../types";
import { isPartyBadgeVisible } from "../utils";
import { PartyBadge } from "./party-badge";

type UserNameWithBadgeProps = {
  name: string;
  membership?: PartyMembership | null;
  className?: string;
  nameClassName?: string;
  badgeClassName?: string;
  badgeSize?: number;
  showBadgeLabel?: boolean;
  membershipCtaHref?: string;
  membershipCtaLabel?: string;
};

export function UserNameWithBadge({
  name,
  membership,
  className,
  nameClassName,
  badgeClassName,
  badgeSize = 20,
  showBadgeLabel = false,
  membershipCtaHref,
  membershipCtaLabel = "党員制度の詳細を見る",
}: UserNameWithBadgeProps) {
  const shouldShowBadge = isPartyBadgeVisible(membership);
  const planConfig = membership ? getPartyPlanConfig(membership.plan) : null;
  const planLabel = planConfig?.label ?? "党員プラン";
  const ctaHref = membershipCtaHref ?? PARTY_MEMBERSHIP_CTA_URL;
  const [isOpen, setIsOpen] = useState(false);

  const togglePopover = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      // Prevent card-level links from triggering when badge is clicked
      event.preventDefault();
      event.stopPropagation();
      if (event.nativeEvent instanceof Event) {
        event.nativeEvent.stopImmediatePropagation?.();
      }
      setIsOpen((prev) => !prev);
    },
    [],
  );

  const handlePointerDownCapture = useCallback(
    (
      event:
        | ReactPointerEvent<HTMLButtonElement>
        | ReactMouseEvent<HTMLButtonElement>,
    ) => {
      // Stop press interactions from bubbling to ancestor links
      event.stopPropagation();
      if (event.nativeEvent instanceof Event) {
        event.nativeEvent.stopImmediatePropagation?.();
      }
    },
    [],
  );

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className={cn("truncate", nameClassName)}>{name}</span>
      {shouldShowBadge && membership && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "inline-flex items-center focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                badgeClassName,
              )}
              aria-label={
                planConfig
                  ? `${planConfig.label}の詳細を見る`
                  : "党員バッジの詳細を見る"
              }
              onClick={togglePopover}
              onPointerDownCapture={handlePointerDownCapture}
              onMouseDownCapture={handlePointerDownCapture}
            >
              <PartyBadge
                plan={membership.plan}
                size={badgeSize}
                showLabel={showBadgeLabel}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-70 space-y-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                <PartyBadge plan={membership.plan} size={22} />
                <span>チームみらい党員（{planLabel}）</span>
              </div>
              <p className="text-sm text-gray-600">
                チームみらい党員制度をチェックしてみませんか？
              </p>
            </div>
            <Button
              asChild
              size="sm"
              className="w-full"
              onClick={(event) => {
                event.stopPropagation();
                setIsOpen(false);
              }}
              onPointerDownCapture={(event) => {
                event.stopPropagation();
              }}
              onMouseDownCapture={(event) => {
                event.stopPropagation();
              }}
            >
              <Link href={ctaHref} target="_blank" rel="noopener noreferrer">
                {membershipCtaLabel}
              </Link>
            </Button>
          </PopoverContent>
        </Popover>
      )}
    </span>
  );
}

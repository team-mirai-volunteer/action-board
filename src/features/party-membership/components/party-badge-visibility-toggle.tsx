"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/styles";
import { updateBadgeVisibility } from "../actions/update-badge-visibility";
import { getPartyPlanConfig } from "../constants/plans";
import type { PartyMembership, PartyPlan } from "../types";
import { PartyBadge } from "./party-badge";

type PartyBadgeVisibilityToggleProps = {
  membership: PartyMembership;
  className?: string;
};

export function PartyBadgeVisibilityToggle({
  membership,
  className,
}: PartyBadgeVisibilityToggleProps) {
  const [visible, setVisible] = useState<boolean>(
    membership.badge_visibility ?? true,
  );
  const [isPending, startTransition] = useTransition();

  const _planConfig = getPartyPlanConfig(membership.plan as PartyPlan);

  const handleChange = (checked: boolean | "indeterminate") => {
    if (checked === "indeterminate") {
      return;
    }

    const nextVisible = Boolean(checked);
    const previous = visible;
    setVisible(nextVisible);

    startTransition(async () => {
      const result = await updateBadgeVisibility(nextVisible);
      if (!result.success) {
        setVisible(previous);
        toast.error(result.error);
        return;
      }
      setVisible(result.membership.badge_visibility ?? true);
      toast.success(
        result.membership.badge_visibility
          ? "党員バッジを表示するように設定しました。"
          : "党員バッジを非表示にしました。",
      );
    });
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white p-4 space-y-3",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl text-gray-900 mb-2">党員バッジの表示設定</h2>
          <p className="text-sm text-gray-600">
            党員として、ユーザー名の隣にバッジを表示するか選択できます。
          </p>
        </div>
      </div>
      <PartyBadge plan={membership.plan} showLabel />
      <div className="flex items-center gap-3">
        <Checkbox
          id="party-badge-visibility"
          checked={visible}
          onCheckedChange={handleChange}
          disabled={isPending}
        />
        <Label
          htmlFor="party-badge-visibility"
          className={cn("text-sm", isPending && "opacity-60")}
        >
          ユーザー名の横に党員バッジを表示する
        </Label>
      </div>
    </div>
  );
}

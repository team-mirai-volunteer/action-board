"use client";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export type RankingPeriod = "all" | "daily";

interface PeriodToggleProps {
  defaultPeriod?: RankingPeriod;
}

const periodOptions = [
  { value: "daily" as const, label: "今日" },
  { value: "all" as const, label: "全期間" },
] as const;

export function PeriodToggle({ defaultPeriod = "daily" }: PeriodToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPeriod =
    (searchParams.get("period") as RankingPeriod) || defaultPeriod;

  const handlePeriodChange = useCallback(
    (period: RankingPeriod) => {
      const params = new URLSearchParams(searchParams.toString());

      params.set("period", period);

      const query = params.toString();
      router.push(`${pathname}${query ? `?${query}` : ""}`);
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="flex justify-center gap-1 p-1 bg-gray-100 rounded-lg max-w-fit mx-auto">
      {periodOptions.map((option) => (
        <Button
          key={option.value}
          variant={currentPeriod === option.value ? "default" : "ghost"}
          size="sm"
          onClick={() => handlePeriodChange(option.value)}
          className={`
            px-4 py-2 text-sm font-medium transition-all
            ${
              currentPeriod === option.value
                ? "bg-teal-600 text-white hover:bg-teal-700"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-200"
            }
          `}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

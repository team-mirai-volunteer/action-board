"use client";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SORT_OPTIONS, type SortType } from "../types";

interface TikTokSortToggleProps {
  defaultSort?: SortType;
}

export function TikTokSortToggle({
  defaultSort = "published_at",
}: TikTokSortToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = (searchParams.get("sort") as SortType) || defaultSort;

  const handleSortChange = useCallback(
    (sort: SortType) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sort", sort);
      const query = params.toString();
      router.push(`${pathname}${query ? `?${query}` : ""}`);
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="flex justify-center gap-1 p-1 bg-gray-100 rounded-lg max-w-fit mx-auto">
      {SORT_OPTIONS.map((option) => (
        <Button
          key={option.value}
          variant={currentSort === option.value ? "default" : "ghost"}
          size="sm"
          onClick={() => handleSortChange(option.value)}
          className={`
            px-4 py-2 text-sm font-medium transition-all
            ${
              currentSort === option.value
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

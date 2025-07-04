"use client";

import { cn } from "@/lib/utils/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface HorizontalScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  scrollDistance?: number;
}

export function HorizontalScrollContainer({
  children,
  className,
  scrollDistance = 316,
}: HorizontalScrollContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    updateScrollButtons();
    scrollElement.addEventListener("scroll", updateScrollButtons);

    const resizeObserver = new ResizeObserver(updateScrollButtons);
    resizeObserver.observe(scrollElement);

    return () => {
      scrollElement.removeEventListener("scroll", updateScrollButtons);
      resizeObserver.disconnect();
    };
  }, [updateScrollButtons]);

  const scrollLeft = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: -scrollDistance,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: scrollDistance,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={scrollLeft}
        disabled={!canScrollLeft}
        className={cn(
          "absolute left-2 top-1/2 -translate-y-1/2 z-10",
          "hidden md:flex items-center justify-center",
          "w-8 h-8 rounded-full bg-white shadow-md border",
          "hover:bg-gray-50 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        )}
        aria-label="前のミッションを表示"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div
        ref={scrollRef}
        className={cn("w-full overflow-x-auto custom-scrollbar", className)}
        style={{ scrollbarWidth: "none" }}
      >
        {children}
      </div>

      <button
        type="button"
        onClick={scrollRight}
        disabled={!canScrollRight}
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2 z-10",
          "hidden md:flex items-center justify-center",
          "w-8 h-8 rounded-full bg-white shadow-md border",
          "hover:bg-gray-50 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        )}
        aria-label="次のミッションを表示"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

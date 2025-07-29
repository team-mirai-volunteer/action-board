"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";
import { useRef } from "react";

type HorizontalScrollContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function HorizontalScrollContainer({
  children,
  className = "",
}: HorizontalScrollContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className={`flex gap-4 overflow-x-auto scrollbar-hide ${className}`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={scrollRight}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils/utils";
import AutoScroll from "embla-carousel-auto-scroll";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";

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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      containScroll: "trimSnaps",
      dragFree: true,
    },
    [
      AutoScroll({
        startDelay: 3000,
        speed: 1,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
      }),
    ],
  );

  const updateScrollButtons = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollLeft(emblaApi.canScrollPrev());
    setCanScrollRight(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkDesktop();
    window.addEventListener("resize", checkDesktop);

    return () => {
      window.removeEventListener("resize", checkDesktop);
    };
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    updateScrollButtons();
    emblaApi.on("reInit", updateScrollButtons);
    emblaApi.on("select", updateScrollButtons);

    return () => {
      emblaApi.off("reInit", updateScrollButtons);
      emblaApi.off("select", updateScrollButtons);
    };
  }, [emblaApi, updateScrollButtons]);

  const scrollLeftButton = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollRight = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative">
      {isDesktop && canScrollLeft && (
        <button
          type="button"
          onClick={scrollLeftButton}
          className={cn(
            "absolute left-2 top-1/2 -translate-y-1/2 z-10",
            "flex items-center justify-center",
            "w-12 h-12 rounded-full bg-white shadow-lg border-2",
            "hover:bg-gray-50 transition-colors",
          )}
          aria-label="前のミッションを表示"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      <div ref={emblaRef} className={cn("w-full overflow-hidden", className)}>
        <div className="flex">{children}</div>
      </div>

      {isDesktop && canScrollRight && (
        <button
          type="button"
          onClick={scrollRight}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 z-10",
            "flex items-center justify-center",
            "w-12 h-12 rounded-full bg-white shadow-lg border-2",
            "hover:bg-gray-50 transition-colors",
          )}
          aria-label="次のミッションを表示"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}

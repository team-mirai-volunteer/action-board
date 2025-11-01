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
  const [isDesktop, setIsDesktop] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [initialScrollLeft, setInitialScrollLeft] = useState(0);

  const updateScrollButtons = useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

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
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleUpdate = () => {
      setTimeout(updateScrollButtons, 0);
    };

    handleUpdate();
    scrollElement.addEventListener("scroll", updateScrollButtons);

    const resizeObserver = new ResizeObserver(handleUpdate);
    resizeObserver.observe(scrollElement);

    return () => {
      scrollElement.removeEventListener("scroll", updateScrollButtons);
      resizeObserver.disconnect();
    };
  }, [updateScrollButtons]);

  const scrollLeftButton = () => {
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

  const handleDragStart = useCallback(
    (clientX: number) => {
      if (!scrollRef.current || !isDesktop) return;

      setIsDragging(true);
      setStartX(clientX);
      setInitialScrollLeft(scrollRef.current.scrollLeft);
    },
    [isDesktop],
  );

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging || !scrollRef.current || !isDesktop) return;

      const deltaX = clientX - startX;
      const newScrollLeft = initialScrollLeft - deltaX;

      scrollRef.current.scrollLeft = newScrollLeft;
    },
    [isDragging, startX, initialScrollLeft, isDesktop],
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging || !isDesktop) return;
    setIsDragging(false);
  }, [isDragging, isDesktop]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isDesktop) return;
      e.preventDefault();
      handleDragStart(e.clientX);
    },
    [handleDragStart, isDesktop],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDesktop) return;
      handleDragMove(e.clientX);
    },
    [handleDragMove, isDesktop],
  );

  const handleMouseUp = useCallback(() => {
    if (!isDesktop) return;
    handleDragEnd();
  }, [handleDragEnd, isDesktop]);

  const handleMouseLeave = useCallback(() => {
    if (!isDesktop) return;
    handleDragEnd();
  }, [handleDragEnd, isDesktop]);

  const button_style = (side: "left-2" | "right-2") =>
    cn(
      side,
      "absolute top-1/2 -translate-y-1/2 z-10",
      "flex items-center justify-center w-12 h-12 rounded-full",
      "bg-white shadow-lg border-2 hover:bg-gray-50 transition-colors",
    );

  return (
    <div className="relative">
      {isDesktop && canScrollLeft && (
        <button
          type="button"
          onClick={scrollLeftButton}
          className={button_style("left-2")}
          aria-label="前のミッションを表示"
        >
          <ChevronLeft />
        </button>
      )}

      <div
        ref={scrollRef}
        className={cn(
          "w-full overflow-x-auto custom-scrollbar",
          isDesktop && isDragging
            ? "cursor-grabbing"
            : isDesktop
              ? "cursor-grab"
              : "",
          className,
        )}
        style={{
          scrollbarWidth: "none",
          userSelect: isDesktop && isDragging ? "none" : "auto",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>

      {isDesktop && canScrollRight && (
        <button
          type="button"
          onClick={scrollRight}
          className={button_style("right-2")}
          aria-label="次のミッションを表示"
        >
          <ChevronRight />
        </button>
      )}
    </div>
  );
}

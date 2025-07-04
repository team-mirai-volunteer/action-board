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

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [initialScrollLeft, setInitialScrollLeft] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [lastMoveX, setLastMoveX] = useState(0);
  const animationRef = useRef<number | null>(null);

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

  const applyMomentum = useCallback(() => {
    if (!scrollRef.current || Math.abs(velocity) < 1) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const element = scrollRef.current;
    const newScrollLeft = element.scrollLeft + velocity;

    const maxScroll = element.scrollWidth - element.clientWidth;
    const boundedScroll = Math.max(0, Math.min(newScrollLeft, maxScroll));

    element.scrollLeft = boundedScroll;

    setVelocity(velocity * 0.85);

    animationRef.current = requestAnimationFrame(applyMomentum);
  }, [velocity]);

  const handleDragStart = useCallback((clientX: number) => {
    if (!scrollRef.current) return;

    setIsDragging(true);
    setStartX(clientX);
    setInitialScrollLeft(scrollRef.current.scrollLeft);
    setVelocity(0);
    setLastMoveTime(Date.now());
    setLastMoveX(clientX);

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging || !scrollRef.current) return;

      const deltaX = clientX - startX;
      const newScrollLeft = initialScrollLeft - deltaX;

      const maxScroll =
        scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      let boundedScroll = Math.max(0, Math.min(newScrollLeft, maxScroll));

      if (newScrollLeft < 0) {
        boundedScroll = newScrollLeft * 0.3;
      } else if (newScrollLeft > maxScroll) {
        boundedScroll = maxScroll + (newScrollLeft - maxScroll) * 0.3;
      }

      scrollRef.current.scrollLeft = boundedScroll;

      const now = Date.now();
      const timeDelta = now - lastMoveTime;
      if (timeDelta > 0) {
        const velocityX = ((clientX - lastMoveX) / timeDelta) * -16; // Convert to pixels per frame
        setVelocity(velocityX);
      }

      setLastMoveTime(now);
      setLastMoveX(clientX);
    },
    [isDragging, startX, initialScrollLeft, lastMoveTime, lastMoveX],
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);

    if (Math.abs(velocity) > 2) {
      applyMomentum();
    }
  }, [isDragging, velocity, applyMomentum]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleDragStart(e.clientX);
    },
    [handleDragStart],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      handleDragMove(e.clientX);
    },
    [handleDragMove],
  );

  const handleMouseUp = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  const handleMouseLeave = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        handleDragStart(e.touches[0].clientX);
      }
    },
    [handleDragStart],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        handleDragMove(e.touches[0].clientX);
      }
    },
    [handleDragMove],
  );

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          type="button"
          onClick={scrollLeftButton}
          className={cn(
            "absolute left-2 top-1/2 -translate-y-1/2 z-10",
            "hidden md:flex items-center justify-center",
            "w-8 h-8 rounded-full bg-white shadow-md border",
            "hover:bg-gray-50 transition-colors",
          )}
          aria-label="前のミッションを表示"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      <div
        ref={scrollRef}
        className={cn(
          "w-full overflow-x-auto custom-scrollbar",
          isDragging ? "cursor-grabbing" : "cursor-grab",
          className,
        )}
        style={{
          scrollbarWidth: "none",
          userSelect: isDragging ? "none" : "auto",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>

      {canScrollRight && (
        <button
          type="button"
          onClick={scrollRight}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 z-10",
            "hidden md:flex items-center justify-center",
            "w-8 h-8 rounded-full bg-white shadow-md border",
            "hover:bg-gray-50 transition-colors",
          )}
          aria-label="次のミッションを表示"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

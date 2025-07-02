"use client";

import type React from "react";
import { type ReactNode, useCallback, useEffect, useRef } from "react";

interface HorizontalScrollContainerProps {
  children: ReactNode;
  className?: string;
}

export default function HorizontalScrollContainer({
  children,
  className = "",
}: HorizontalScrollContainerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const isTouchDevice =
    typeof window !== "undefined" && "ontouchstart" in window;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current || isTouchDevice) return;

    const target = e.target;
    if (
      target instanceof HTMLElement &&
      ["BUTTON", "A"].includes(target.tagName)
    ) {
      return;
    }

    isDraggingRef.current = true;
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;

    scrollContainerRef.current.style.cursor = "grabbing";
    scrollContainerRef.current.style.userSelect = "none";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollContainerRef.current || isTouchDevice)
      return;

    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.0;
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const stopDragging = useCallback(() => {
    if (!scrollContainerRef.current) return;
    isDraggingRef.current = false;
    scrollContainerRef.current.style.cursor = "grab";
    scrollContainerRef.current.style.userSelect = "auto";
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;

    const handleWindowMouseUp = () => {
      if (isDraggingRef.current) {
        stopDragging();
      }
    };

    window.addEventListener("mouseup", handleWindowMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [isTouchDevice, stopDragging]);

  return (
    <div
      ref={scrollContainerRef}
      className={`w-full overflow-x-auto custom-scrollbar ${className}`}
      style={{
        scrollbarWidth: "thin",
        cursor: "grab",
        WebkitOverflowScrolling: "touch",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    >
      {children}
    </div>
  );
}

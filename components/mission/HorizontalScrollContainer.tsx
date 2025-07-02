"use client";

import type React from "react";
import { type ReactNode, useRef } from "react";

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

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;

    isDraggingRef.current = true;
    startXRef.current = e.touches[0].clientX;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;

    e.preventDefault();
    const x = e.touches[0].clientX;
    const walk = (startXRef.current - x) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current + walk;
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;

    isDraggingRef.current = true;
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;

    scrollContainerRef.current.style.cursor = "grabbing";
    scrollContainerRef.current.style.userSelect = "none";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;

    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.0;
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    if (!scrollContainerRef.current) return;

    isDraggingRef.current = false;
    scrollContainerRef.current.style.cursor = "grab";
    scrollContainerRef.current.style.userSelect = "auto";
  };

  const handleMouseLeave = () => {
    if (!scrollContainerRef.current) return;

    isDraggingRef.current = false;
    scrollContainerRef.current.style.cursor = "grab";
    scrollContainerRef.current.style.userSelect = "auto";
  };

  return (
    <div
      ref={scrollContainerRef}
      className={`w-full overflow-x-auto custom-scrollbar ${className}`}
      style={{
        scrollbarWidth: "thin",
        cursor: "grab",
        scrollBehavior: "smooth",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

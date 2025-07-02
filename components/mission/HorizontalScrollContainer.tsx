"use client";

import type React from "react";
import { type ReactNode, useEffect, useRef } from "react";

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
  const lastTouchXRef = useRef(0);
  const lastTouchTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const element = scrollContainerRef.current;
    if (!element) return;

    const startMomentumAnimation = () => {
      if (Math.abs(velocityRef.current) < 0.1) return;

      const animate = () => {
        if (!element) return;

        velocityRef.current *= 0.95;

        if (Math.abs(velocityRef.current) < 0.1) {
          animationFrameRef.current = null;
          return;
        }

        element.scrollLeft += velocityRef.current;

        if (element.scrollLeft <= 0) {
          element.scrollLeft = 0;
          animationFrameRef.current = null;
          return;
        }

        if (element.scrollLeft >= element.scrollWidth - element.clientWidth) {
          element.scrollLeft = element.scrollWidth - element.clientWidth;
          animationFrameRef.current = null;
          return;
        }

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      isDraggingRef.current = true;
      startXRef.current = e.touches[0].clientX;
      scrollLeftRef.current = element.scrollLeft;
      lastTouchXRef.current = e.touches[0].clientX;
      lastTouchTimeRef.current = Date.now();
      velocityRef.current = 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;

      e.preventDefault();
      const x = e.touches[0].clientX;
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTouchTimeRef.current;

      if (deltaTime > 0) {
        velocityRef.current = ((lastTouchXRef.current - x) / deltaTime) * 16;
      }

      const walk = (startXRef.current - x) * 1.0;
      element.scrollLeft = scrollLeftRef.current + walk;

      lastTouchXRef.current = x;
      lastTouchTimeRef.current = currentTime;
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
      startMomentumAnimation();
    };

    element.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

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
    const walk = (x - startXRef.current) * 1.0; // スクロール感度調整
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
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

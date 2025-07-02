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
  const scrollRef = useRef<HTMLDivElement>(null);
  const isTouch = typeof window !== "undefined" && "ontouchstart" in window;

  // ドラッグによるスクロール制御
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const stopDragging = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = false;
    el.style.cursor = "grab";
    el.style.userSelect = "auto";
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el || isTouch) return;
    const targetEl = e.target as HTMLElement;

    // クリック対象がインタラクティブ要素または画像ならドラッグ開始しない
    if (targetEl.closest("button, a, img")) return;

    isDragging.current = true;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeft.current = el.scrollLeft;
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";

    // ドキュメント全体で mouseup を監視（画像などで捕捉できないケースに対応）
    const handleDocumentMouseUp = () => {
      stopDragging();
      document.removeEventListener("mouseup", handleDocumentMouseUp);
    };
    document.addEventListener("mouseup", handleDocumentMouseUp);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!isDragging.current || !el || isTouch) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.0;
    el.scrollLeft = scrollLeft.current - walk;
  };

  useEffect(() => {
    if (isTouch) return;
    const onUp = () => isDragging.current && stopDragging();
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, [isTouch, stopDragging]);

  return (
    <div
      ref={scrollRef}
      className={`w-full overflow-x-auto ${className}`}
      style={{
        cursor: "grab",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    >
      {children}
    </div>
  );
}

"use client";

import type React from "react";
import { useState } from "react";

interface TooltipButtonProps {
  children: React.ReactNode;
  tooltip: React.ReactNode;
  ariaLabel: string;
  tooltipId: string;
}

export function TooltipButton({
  children,
  tooltip,
  ariaLabel,
  tooltipId,
}: TooltipButtonProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  return (
    <div className="group relative">
      <button
        type="button"
        className="text-gray-400 hover:text-gray-600"
        aria-label={ariaLabel}
        aria-describedby={tooltipId}
        onFocus={() => setTooltipVisible(true)}
        onBlur={() => setTooltipVisible(false)}
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setTooltipVisible(false);
          }
        }}
      >
        {children}
      </button>
      <div
        id={tooltipId}
        className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-10 ${
          tooltipVisible ? "visible" : "invisible"
        }`}
      >
        {tooltip}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
      </div>
    </div>
  );
}

"use client";

import { ArrowDown } from "lucide-react";
import React from "react";

type MissionGuidanceArrowProps = {
  className?: string;
};

export function MissionGuidanceArrow({
  className = "",
}: MissionGuidanceArrowProps) {
  return (
    <div className={`flex justify-center items-center py-4 ${className}`}>
      <div className="animate-bounce">
        <ArrowDown className="h-6 w-6 text-blue-500" />
      </div>
    </div>
  );
}

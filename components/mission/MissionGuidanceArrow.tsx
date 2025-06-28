"use client";

import { ChevronDown } from "lucide-react";
import React from "react";

export function MissionGuidanceArrow() {
  return (
    <div className="flex flex-col items-center py-4 text-muted-foreground">
      <p className="text-sm font-medium mb-2">実行したら記録しよう！</p>
      <ChevronDown className="h-6 w-6" />
    </div>
  );
}

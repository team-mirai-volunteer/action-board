import { TooltipProvider } from "@/components/ui/tooltip";
import React, { Suspense } from "react";
import { MetricsErrorBoundary } from "./MetricsErrorBoundary";
import Metrics from "./index";

function MetricsSkeleton() {
  return (
    <section className="bg-gradient-hero flex justify-center py-6 px-4">
      <div className="w-full max-w-xl bg-white rounded-md shadow-custom p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-black mb-1">
            チームみらいの活動状況🚀
          </h2>
          <output aria-live="polite">
            <span className="sr-only">メトリクスを読み込み中...</span>
            <p className="text-xs text-black">読み込み中...</p>
          </output>
        </div>
        <div className="animate-pulse">
          <div className="mb-6">
            <div className="p-4 text-center bg-gray-100 rounded">
              <div className="h-4 bg-gray-300 rounded mb-2" />
              <div className="h-8 bg-gray-300 rounded mb-1" />
              <div className="h-4 bg-gray-300 rounded" />
            </div>
          </div>
          <div className="flex items-stretch gap-4">
            <div className="flex-1 text-center">
              <div className="h-4 bg-gray-300 rounded mb-2" />
              <div className="h-6 bg-gray-300 rounded mb-1" />
              <div className="h-4 bg-gray-300 rounded" />
            </div>
            <div className="flex-1 text-center">
              <div className="h-4 bg-gray-300 rounded mb-2" />
              <div className="h-6 bg-gray-300 rounded mb-1" />
              <div className="h-4 bg-gray-300 rounded" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function MetricsWithSuspense() {
  return (
    <MetricsErrorBoundary>
      <TooltipProvider delayDuration={0}>
        <Suspense fallback={<MetricsSkeleton />}>
          <Metrics />
        </Suspense>
      </TooltipProvider>
    </MetricsErrorBoundary>
  );
}

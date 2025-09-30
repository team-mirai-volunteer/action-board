import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { MetricsErrorBoundary } from "./metrics-error-boundary";
import { Metrics } from "./metrics-index";

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
        <div className="space-y-6">
          <div className="p-4 text-center bg-gray-50 rounded">
            <Skeleton className="h-4 w-24 mx-auto mb-2" />
            <Skeleton className="h-8 w-32 mx-auto mb-1" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
          <div className="flex items-stretch gap-4">
            <div className="flex-1 text-center">
              <Skeleton className="h-4 w-20 mx-auto mb-2" />
              <Skeleton className="h-6 w-16 mx-auto mb-1" />
              <Skeleton className="h-4 w-12 mx-auto" />
            </div>
            <div className="flex-1 text-center">
              <Skeleton className="h-4 w-20 mx-auto mb-2" />
              <Skeleton className="h-6 w-16 mx-auto mb-1" />
              <Skeleton className="h-4 w-12 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function MetricsWithSuspense() {
  return (
    <MetricsErrorBoundary>
      <Suspense fallback={<MetricsSkeleton />}>
        <Metrics />
      </Suspense>
    </MetricsErrorBoundary>
  );
}

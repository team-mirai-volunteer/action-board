import { Suspense } from "react";
import {
  TOP_SECTION_CARD_CLASS_NAME,
  TopSectionLayout,
} from "@/components/top/top-section-layout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { METRICS_SECTION_TITLE } from "./metrics-constants";
import { MetricsErrorBoundary } from "./metrics-error-boundary";
import { Metrics } from "./metrics-index";

function MetricsSkeleton() {
  return (
    <section className="py-12 md:py-16 bg-background">
      <TopSectionLayout
        title={METRICS_SECTION_TITLE}
        subtitle={
          <output aria-live="polite">
            <span className="sr-only">メトリクスを読み込み中...</span>
            読み込み中...
          </output>
        }
      >
        <Card className={TOP_SECTION_CARD_CLASS_NAME}>
          <div className="space-y-6">
            <div className="p-4 text-center bg-muted rounded">
              <Skeleton className="h-4 w-24 mx-auto mb-2" />
              <Skeleton className="h-8 w-32 mx-auto mb-1" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </div>
          </div>
        </Card>
      </TopSectionLayout>
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

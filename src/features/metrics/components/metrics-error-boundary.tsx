"use client";

import React from "react";
import {
  TOP_SECTION_CARD_CLASS_NAME,
  TopSectionLayout,
} from "@/components/top/top-section-layout";
import { Card } from "@/components/ui/card";
import { METRICS_SECTION_TITLE } from "./metrics-constants";

interface MetricsErrorBoundaryProps {
  children: React.ReactNode;
}

interface MetricsErrorBoundaryState {
  hasError: boolean;
}

export class MetricsErrorBoundary extends React.Component<
  MetricsErrorBoundaryProps,
  MetricsErrorBoundaryState
> {
  constructor(props: MetricsErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): MetricsErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Metrics component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="py-12 md:py-16 bg-background">
          <TopSectionLayout title={METRICS_SECTION_TITLE}>
            <Card className={TOP_SECTION_CARD_CLASS_NAME}>
              <div role="alert" className="text-center text-red-600 text-sm">
                メトリクスの読み込みに失敗しました
              </div>
            </Card>
          </TopSectionLayout>
        </section>
      );
    }

    return this.props.children;
  }
}

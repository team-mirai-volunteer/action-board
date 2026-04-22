"use client";

import React from "react";

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
        <section className="flex justify-center py-10 px-4">
          <div className="w-full max-w-lg bg-white rounded-md shadow-custom p-6 py-8">
            <div className="text-center">
              <h2 className="text-xl font-bold text-black mb-2">
                チームみらいの活動状況🚀
              </h2>
              <div role="alert" className="text-red-600 text-sm">
                メトリクスの読み込みに失敗しました
              </div>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}

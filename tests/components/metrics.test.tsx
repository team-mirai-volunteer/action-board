import { render } from "@testing-library/react";
import React from "react";
import Metrics from "../../components/metrics";

jest.mock("../../components/metric-card", () => ({
  MetricCard: ({ title, value }: { title: string; value: number }) => (
    <div data-testid="metric-card">
      {title}: {value}
    </div>
  ),
}));

describe("Metrics", () => {
  it("メトリクスコンポーネントの正常レンダリング", async () => {
    const MetricsComponent = await Metrics();
    const { container } = render(MetricsComponent);
    expect(container.firstChild).toHaveClass("max-w-6xl");
  });

  it("メトリクスデータの表示", async () => {
    const MetricsComponent = await Metrics();
    const { container } = render(MetricsComponent);
    expect(container.querySelector(".grid")).toBeInTheDocument();
  });
});

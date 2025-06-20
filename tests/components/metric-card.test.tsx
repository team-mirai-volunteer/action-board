import { render } from "@testing-library/react";
import type React from "react";
import { MetricCard } from "../../components/metric-card";

jest.mock("../../components/ui/card", () => ({
  Card: ({
    children,
    className,
  }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

describe("MetricCard", () => {
  it("メトリックカードの正常表示", () => {
    const { container } = render(
      <MetricCard
        title="テストメトリック"
        description="説明"
        value={100}
        unit="件"
      />,
    );
    expect(container.firstChild).toHaveClass("bg-gradient-to-br");
  });

  it("今日の値付きメトリックの表示", () => {
    const { getByText } = render(
      <MetricCard
        title="ユーザー数"
        description="総数"
        value={50}
        unit="人"
        todayValue={5}
        todayUnit="人"
      />,
    );
    expect(getByText("ユーザー数")).toBeInTheDocument();
  });
});

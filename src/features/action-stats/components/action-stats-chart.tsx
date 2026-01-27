"use client";

import { Card } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import type { DailyActionItem } from "../types";

interface ActionStatsChartProps {
  data: DailyActionItem[];
}

const chartConfig = {
  count: {
    label: "アクション数",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function ActionStatsChart({ data }: ActionStatsChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-2">日別アクション数</h3>
        <div className="text-center text-gray-400 text-sm py-8">
          データがありません
        </div>
      </Card>
    );
  }

  // 日付をフォーマット
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium mb-2">日別アクション数</h3>
      <ChartContainer config={chartConfig} className="h-[200px] w-full">
        <BarChart data={formattedData}>
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={10}
            interval="preserveStartEnd"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={10}
            allowDecimals={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="count"
            fill="var(--color-count)"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}

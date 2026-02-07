"use client";

import { Line, LineChart, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatChartDates } from "@/lib/utils/chart-transforms";
import { formatNumberJaShort } from "@/lib/utils/format-number-ja";
import type { DailyActionItem } from "../types";

interface ActionStatsChartProps {
  data: DailyActionItem[];
}

const chartConfig = {
  count: {
    label: "アクション数",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function ActionStatsChart({ data }: ActionStatsChartProps) {
  if (data.length < 2) {
    return (
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-2">日別アクション数</h3>
        <div className="text-center text-gray-400 text-sm py-8">
          統計データが不足しています
        </div>
      </Card>
    );
  }

  const formattedData = formatChartDates(data);

  return (
    <Card className="p-4 overflow-hidden">
      <h3 className="text-sm font-medium mb-2">日別アクション数</h3>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <LineChart data={formattedData}>
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={10}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={10}
            tickFormatter={formatNumberJaShort}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="count"
            stroke="var(--color-count)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </Card>
  );
}

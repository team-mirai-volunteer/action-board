"use client";

import { Card } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis } from "recharts";
import type { OverallStatsHistoryItem } from "../types";
import { formatNumberJaShort } from "../utils/format";

interface YouTubeOverallChartProps {
  data: OverallStatsHistoryItem[];
}

const chartConfig = {
  total_views: {
    label: "総再生数",
    color: "hsl(var(--chart-1))",
  },
  total_likes: {
    label: "総いいね",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function YouTubeOverallChart({ data }: YouTubeOverallChartProps) {
  if (data.length < 2) {
    return (
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-2">全体推移</h3>
        <div className="text-center text-gray-400 text-sm py-8">
          統計データが不足しています
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
      <h3 className="text-sm font-medium mb-2">全体推移（再生数・いいね数）</h3>
      <ChartContainer config={chartConfig} className="h-[200px] w-full">
        <LineChart data={formattedData}>
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={10}
          />
          <YAxis
            yAxisId="left"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={10}
            tickFormatter={formatNumberJaShort}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={10}
            tickFormatter={formatNumberJaShort}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="total_views"
            stroke="var(--color-total_views)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="total_likes"
            stroke="var(--color-total_likes)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </Card>
  );
}

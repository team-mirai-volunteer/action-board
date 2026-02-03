"use client";

import { Line, LineChart, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { StatsHistory } from "../types";

interface YouTubeStatsChartProps {
  data: StatsHistory[];
}

const chartConfig = {
  view_count: {
    label: "再生数",
    color: "hsl(var(--chart-1))",
  },
  like_count: {
    label: "いいね",
    color: "hsl(var(--chart-2))",
  },
  comment_count: {
    label: "コメント",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function YouTubeStatsChart({ data }: YouTubeStatsChartProps) {
  if (data.length < 2) {
    return (
      <div className="text-center text-gray-400 text-sm py-4">
        統計データが不足しています
      </div>
    );
  }

  // 日付をフォーマット
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.recorded_at).toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
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
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={10}
          tickFormatter={(value) =>
            value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value
          }
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          type="monotone"
          dataKey="view_count"
          stroke="var(--color-view_count)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="like_count"
          stroke="var(--color-like_count)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="comment_count"
          stroke="var(--color-comment_count)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}

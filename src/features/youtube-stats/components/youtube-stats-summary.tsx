import { Card } from "@/components/ui/card";
import type { StatsSummary } from "../types";

interface YouTubeStatsSummaryProps {
  summary: StatsSummary;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

export function YouTubeStatsSummary({ summary }: YouTubeStatsSummaryProps) {
  const stats = [
    { label: "動画数", value: summary.totalVideos, icon: "📺" },
    { label: "総再生数", value: summary.totalViews, icon: "👁" },
    { label: "総いいね", value: summary.totalLikes, icon: "👍" },
    { label: "総コメント", value: summary.totalComments, icon: "💬" },
  ];

  return (
    <Card className="p-4">
      <div className="flex flex-wrap justify-center gap-4 md:gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-2">
            <span className="text-lg">{stat.icon}</span>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                {formatNumber(stat.value)}
              </div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

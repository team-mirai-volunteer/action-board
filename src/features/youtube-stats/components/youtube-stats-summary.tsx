import { Card } from "@/components/ui/card";
import { Eye, MessageCircle, MonitorPlay, ThumbsUp } from "lucide-react";
import type { StatsSummary } from "../types";
import { formatNumberJa } from "../utils/format";

interface YouTubeStatsSummaryProps {
  summary: StatsSummary;
}

export function YouTubeStatsSummary({ summary }: YouTubeStatsSummaryProps) {
  const stats = [
    {
      label: "動画数",
      value: summary.totalVideos,
      icon: <MonitorPlay className="w-5 h-5" />,
    },
    {
      label: "総再生数",
      value: summary.totalViews,
      icon: <Eye className="w-5 h-5" />,
    },
    {
      label: "総いいね",
      value: summary.totalLikes,
      icon: <ThumbsUp className="w-5 h-5" />,
    },
    {
      label: "総コメント",
      value: summary.totalComments,
      icon: <MessageCircle className="w-5 h-5" />,
    },
  ];

  return (
    <Card className="p-4">
      <div className="flex flex-wrap justify-center gap-4 md:gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-2">
            <span className="text-gray-600">{stat.icon}</span>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                {formatNumberJa(stat.value)}
              </div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

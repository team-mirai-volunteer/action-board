import { Card } from "@/components/ui/card";
import { CheckCircle, TrendingUp, Users } from "lucide-react";
import type { ActionStatsSummary as ActionStatsSummaryType } from "../types";
import { formatNumberJa } from "../utils/format";

interface ActionStatsSummaryProps {
  summary: ActionStatsSummaryType;
}

export function ActionStatsSummary({ summary }: ActionStatsSummaryProps) {
  const stats = [
    {
      label: "総アクション数",
      value: summary.totalActions,
      icon: <CheckCircle className="w-5 h-5" />,
      increase: summary.dailyActionsIncrease,
      increaseLabel: "1日で",
    },
    {
      label: "アクティブユーザー",
      value: summary.activeUsers,
      icon: <Users className="w-5 h-5" />,
      increase: summary.dailyActiveUsersIncrease,
      increaseLabel: "1日で",
    },
  ];

  return (
    <Card className="p-4">
      <div className="flex flex-wrap justify-center gap-6 md:gap-12">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3">
            <span className="text-gray-600">{stat.icon}</span>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumberJa(stat.value)}
              </div>
              <div className="text-xs text-gray-500">{stat.label}</div>
              {stat.increase > 0 && (
                <div className="flex items-center gap-1 text-xs text-teal-600 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>
                    {stat.increaseLabel} +{formatNumberJa(stat.increase)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

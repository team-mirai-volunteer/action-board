import { Card } from "@/components/ui/card";
import { TrendingUp, Users, Zap } from "lucide-react";
import type { ActionStatsSummary as ActionStatsSummaryType } from "../types";

interface ActionStatsSummaryProps {
  summary: ActionStatsSummaryType;
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

export function ActionStatsSummary({ summary }: ActionStatsSummaryProps) {
  const stats = [
    {
      label: "総アクション数",
      value: summary.totalActions,
      increase: summary.dailyActionsIncrease,
      icon: <Zap className="w-5 h-5" />,
    },
    {
      label: "アクティブユーザー数",
      value: summary.activeUsers,
      increase: summary.dailyUsersIncrease,
      icon: <Users className="w-5 h-5" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-gray-600">{stat.icon}</span>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(stat.value)}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
              {stat.increase !== undefined && stat.increase > 0 && (
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+{formatNumber(stat.increase)} (24h)</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

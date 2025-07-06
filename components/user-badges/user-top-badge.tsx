import { Badge } from "@/components/ui/badge";
import { getUserTopBadge } from "@/lib/services/badges";
import { getBadgeEmoji, getBadgeTitle } from "@/lib/types/badge";

interface UserTopBadgeProps {
  userId: string;
}

export async function UserTopBadge({ userId }: UserTopBadgeProps) {
  const topBadge = await getUserTopBadge(userId);

  if (!topBadge) {
    return null;
  }

  const emoji = getBadgeEmoji(topBadge.rank);
  const title = getBadgeTitle(topBadge);

  const getGradientClass = (rank: number) => {
    if (rank <= 10) {
      // TOP 10: 控えめなエメラルドグラデーション
      return "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0";
    }
    if (rank <= 50) {
      // TOP 50: 控えめなライトグリーングラデーション
      return "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 border-0";
    }
    // TOP 100: ほぼフラットなペールグリーン
    return "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-600 border-0";
  };

  return (
    <Badge
      className={`flex items-center gap-1 w-fit shadow-sm ${getGradientClass(topBadge.rank)}`}
    >
      <span className="text-base">{emoji}</span>
      <span className="font-medium">{title}</span>
    </Badge>
  );
}

import { Badge } from "@/components/ui/badge";
import { getUserBadges } from "@/lib/services/badges";
import {
  type UserBadge,
  getBadgeEmoji,
  getBadgeTitle,
} from "@/lib/types/badge";

interface UserBadgesProps {
  userId: string;
}

export async function UserBadges({ userId }: UserBadgesProps) {
  const badges = await getUserBadges(userId);

  if (badges.length === 0) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="text-sm text-muted-foreground">
          まだバッジを獲得していません
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <BadgeItem key={badge.id} badge={badge} />
      ))}
    </div>
  );
}

function BadgeItem({ badge }: { badge: UserBadge }) {
  const emoji = getBadgeEmoji(badge.rank);
  const title = getBadgeTitle(badge);

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
      className={`flex items-center gap-1 shadow-sm ${getGradientClass(badge.rank)}`}
    >
      <span className="text-base">{emoji}</span>
      <span className="font-medium">{title}</span>
    </Badge>
  );
}

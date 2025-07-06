import { Badge } from "@/components/ui/badge";
import {
  type UserBadge,
  getBadgeEmoji,
  getBadgeTitle,
} from "@/lib/types/badge";

interface BadgeDisplayProps {
  badge: UserBadge;
  showTitle?: boolean;
  className?: string;
}

export function getGradientClass(rank: number): string {
  return "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0";
}

export function BadgeDisplay({
  badge,
  showTitle = true,
  className = "",
}: BadgeDisplayProps) {
  const emoji = getBadgeEmoji(badge.rank);
  const title = showTitle ? getBadgeTitle(badge) : null;

  return (
    <Badge
      className={`flex items-center gap-1 shadow-sm ${getGradientClass(badge.rank)} ${className}`}
    >
      <span className="text-base">{emoji}</span>
      {title && <span className="font-medium">{title}</span>}
    </Badge>
  );
}

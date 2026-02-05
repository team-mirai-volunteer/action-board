import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  getBadgeEmoji,
  getBadgeRankingUrl,
  getBadgeTitle,
  type UserBadge,
} from "@/features/user-badges/badge-types";

interface BadgeDisplayProps {
  badge: UserBadge;
  showTitle?: boolean;
  className?: string;
  clickable?: boolean;
}

export function getGradientClass(_rank: number): string {
  return "bg-mirai-gradient";
}

export function BadgeItem({
  badge,
  showTitle = true,
  className = "",
  clickable = true,
}: BadgeDisplayProps) {
  const emoji = getBadgeEmoji(badge.rank);
  const title = showTitle ? getBadgeTitle(badge) : null;
  const url = getBadgeRankingUrl(badge);

  const badgeContent = (
    <Badge
      className={`flex items-center gap-1 shadow-xs ${getGradientClass(badge.rank)} ${
        clickable && url
          ? "cursor-pointer hover:opacity-80 transition-opacity"
          : ""
      } ${className}`}
    >
      <span className="text-base">{emoji}</span>
      {title && <span className="font-bold">{title}</span>}
    </Badge>
  );

  if (clickable && url) {
    return (
      <Link href={url} className="inline-block">
        {badgeContent}
      </Link>
    );
  }

  return badgeContent;
}

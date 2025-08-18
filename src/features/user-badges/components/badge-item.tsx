import { Badge } from "@/components/ui/badge";
import {
  type UserBadge,
  getBadgeEmoji,
  getBadgeRankingUrl,
  getBadgeTitle,
} from "@/features/user-badges/badge-types";
import Link from "next/link";

interface BadgeDisplayProps {
  badge: UserBadge;
  showTitle?: boolean;
  className?: string;
  clickable?: boolean;
}

export function getGradientClass(rank: number): string {
  return "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0";
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
      className={`flex items-center gap-1 shadow-sm ${getGradientClass(badge.rank)} ${
        clickable && url
          ? "cursor-pointer hover:opacity-80 transition-opacity"
          : ""
      } ${className}`}
    >
      <span className="text-base">{emoji}</span>
      {title && <span className="font-medium">{title}</span>}
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

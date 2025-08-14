"use client";

import { Badge } from "@/components/ui/badge";
import { getUserBadges } from "@/lib/services/badges";
import {
  type UserBadge,
  getBadgeEmoji,
  getBadgeTitle,
} from "@/lib/types/badge";
import { useEffect, useState } from "react";

interface UserBadgesProps {
  userId: string;
}

export function UserBadges({ userId }: UserBadgesProps) {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBadges() {
      try {
        const userBadges = await getUserBadges(userId);
        setBadges(userBadges);
      } catch (error) {
        console.error("Error fetching badges:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBadges();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="text-sm text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="text-sm text-muted-foreground">
          まだバッジを獲得していません
        </div>
      </div>
    );
  }

  // バッジをタイプ別にグループ化
  const groupedBadges = badges.reduce(
    (acc, badge) => {
      const key = badge.badge_type;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(badge);
      return acc;
    },
    {} as Record<string, UserBadge[]>,
  );

  return (
    <div className="space-y-4">
      {/* 総合ランキングバッジ */}
      {groupedBadges.ALL && (
        <div>
          <h4 className="text-sm font-medium mb-2">総合ランキング</h4>
          <div className="flex flex-wrap gap-2">
            {groupedBadges.ALL.map((badge) => (
              <BadgeItem key={badge.id} badge={badge} />
            ))}
          </div>
        </div>
      )}

      {/* デイリーランキングバッジ */}
      {groupedBadges.DAILY && (
        <div>
          <h4 className="text-sm font-medium mb-2">デイリーランキング</h4>
          <div className="flex flex-wrap gap-2">
            {groupedBadges.DAILY.map((badge) => (
              <BadgeItem key={badge.id} badge={badge} />
            ))}
          </div>
        </div>
      )}

      {/* 都道府県ランキングバッジ */}
      {groupedBadges.PREFECTURE && (
        <div>
          <h4 className="text-sm font-medium mb-2">都道府県ランキング</h4>
          <div className="flex flex-wrap gap-2">
            {groupedBadges.PREFECTURE.map((badge) => (
              <BadgeItem key={badge.id} badge={badge} />
            ))}
          </div>
        </div>
      )}

      {/* ミッションランキングバッジ */}
      {groupedBadges.MISSION && (
        <div>
          <h4 className="text-sm font-medium mb-2">ミッションランキング</h4>
          <div className="flex flex-wrap gap-2">
            {groupedBadges.MISSION.map((badge) => (
              <BadgeItem key={badge.id} badge={badge} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BadgeItem({ badge }: { badge: UserBadge }) {
  const emoji = getBadgeEmoji(badge.rank);
  const title = getBadgeTitle(badge);

  return (
    <Badge
      variant={
        badge.rank <= 10
          ? "default"
          : badge.rank <= 50
            ? "secondary"
            : "outline"
      }
      className="flex items-center gap-1"
    >
      <span className="text-base">{emoji}</span>
      <span>{title}</span>
    </Badge>
  );
}

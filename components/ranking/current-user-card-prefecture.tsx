import type { UserRanking } from "@/lib/services/ranking";
import BaseCurrentUserCard from "./base-current-user-card";
import { LevelBadge } from "./ranking-level-badge";

interface CurrentUserCardProps {
  currentUser: UserRanking | null;
  prefecture: string;
}

export const CurrentUserCardPrefecture: React.FC<CurrentUserCardProps> = ({
  currentUser,
  prefecture: _prefecture, // 将来の使用のために保持
}) => {
  if (!currentUser || !currentUser.user_id) {
    return null;
  }

  const displayUser = {
    ...currentUser,
    level: currentUser.level || 0,
    xp: currentUser.xp || 0,
  };

  const userForCard = {
    user_id: currentUser.user_id,
    name: currentUser.name,
    address_prefecture: currentUser.address_prefecture,
    rank: currentUser.rank,
  };

  return (
    <BaseCurrentUserCard currentUser={userForCard}>
      <div className="flex items-center gap-2 mb-1">
        <LevelBadge level={displayUser.level} />
        <div className="text-lg font-bold">
          {displayUser.xp.toLocaleString()}pt
        </div>
      </div>
    </BaseCurrentUserCard>
  );
};

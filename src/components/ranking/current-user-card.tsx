import { LevelBadge } from "@/components/ranking/ranking-level-badge";
import type { UserRanking } from "@/lib/services/ranking";
import BaseCurrentUserCard from "./base-current-user-card";

interface CurrentUserCardProps {
  currentUser: UserRanking | null;
}

export const CurrentUserCard: React.FC<CurrentUserCardProps> = ({
  currentUser,
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

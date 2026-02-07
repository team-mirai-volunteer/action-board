import { formatNumberJa } from "@/lib/utils/format-number-ja";
import type { UserRanking } from "../types/ranking-types";
import { BaseCurrentUserCard } from "./base-current-user-card";
import { LevelBadge } from "./ranking-level-badge";

interface CurrentUserCardProps {
  currentUser: UserRanking | null;
}

export const CurrentUserCard: React.FC<CurrentUserCardProps> = ({
  currentUser,
}) => {
  if (!currentUser?.user_id) {
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
    party_membership: currentUser.party_membership ?? null,
  };

  return (
    <BaseCurrentUserCard currentUser={userForCard}>
      <div className="flex items-center gap-2 mb-1">
        <LevelBadge level={displayUser.level} />
        <div className="text-lg font-bold">
          {formatNumberJa(displayUser.xp)}pt
        </div>
      </div>
    </BaseCurrentUserCard>
  );
};

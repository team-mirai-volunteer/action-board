import type { UserRanking } from "../types/ranking-types";
import { BaseCurrentUserCard } from "./base-current-user-card";

interface CurrentUserCardProps {
  currentUser: UserRanking | null;
  prefecture: string;
}

export const CurrentUserCardPrefecture: React.FC<CurrentUserCardProps> = ({
  currentUser,
  prefecture: _prefecture, // 将来の使用のために保持
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
    <BaseCurrentUserCard currentUser={userForCard} level={displayUser.level}>
      <div className="text-lg font-bold">
        {displayUser.xp.toLocaleString()}pt
      </div>
    </BaseCurrentUserCard>
  );
};

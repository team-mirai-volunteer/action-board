import type { Tables } from "@/lib/types/supabase";
import type { UserMissionRanking } from "../types/ranking-types";
import { BaseCurrentUserCard } from "./base-current-user-card";
import { LevelBadge } from "./ranking-level-badge";

interface CurrentUserCardProps {
  currentUser: UserMissionRanking | null;
  mission: Tables<"missions">;
  badgeText: string;
}

export const CurrentUserCardMission: React.FC<CurrentUserCardProps> = ({
  currentUser,
  mission: _mission, // 将来の使用のために保持
  badgeText,
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
  };

  return (
    <BaseCurrentUserCard currentUser={userForCard}>
      <div className="flex items-center gap-3">
        <LevelBadge level={displayUser.level} />
        <div className="text-lg font-bold">{badgeText}</div>
      </div>
    </BaseCurrentUserCard>
  );
};

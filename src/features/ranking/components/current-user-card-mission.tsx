import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/lib/types/supabase";
import type { UserMissionRanking } from "../types/ranking-types";
import { BaseCurrentUserCard } from "./base-current-user-card";

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
  if (!currentUser || !currentUser.user_id) {
    return null;
  }

  const userForCard = {
    user_id: currentUser.user_id,
    name: currentUser.name,
    address_prefecture: currentUser.address_prefecture,
    rank: currentUser.rank,
  };

  return (
    <BaseCurrentUserCard currentUser={userForCard}>
      <div className="flex items-center gap-3">
        <Badge
          className={"bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full"}
        >
          {badgeText}
        </Badge>
        <span className="font-bold text-lg">
          {(currentUser.total_points ?? 0).toLocaleString()}pt
        </span>
      </div>
    </BaseCurrentUserCard>
  );
};

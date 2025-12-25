import { getUserBadges } from "../services/get-user-badges";
import { BadgeItem } from "./badge-item";

interface UserBadgesProps {
  userId: string;
  seasonId?: string;
}

export async function UserBadges({ userId, seasonId }: UserBadgesProps) {
  const badges = await getUserBadges(userId, seasonId);

  if (badges.length === 0) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="text-sm text-muted-foreground">
          まだバッジを獲得していません
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <BadgeItem key={badge.id} badge={badge} />
      ))}
    </div>
  );
}

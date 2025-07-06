import { getUserBadges } from "@/lib/services/badges";
import { BadgeDisplay } from "./badge-display";

interface UserBadgesProps {
  userId: string;
}

export async function UserBadges({ userId }: UserBadgesProps) {
  const badges = await getUserBadges(userId);

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
        <BadgeDisplay key={badge.id} badge={badge} />
      ))}
    </div>
  );
}

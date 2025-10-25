import { Card, CardTitle } from "@/components/ui/card";
import { getUserBadges } from "../services/get-user-badges";
import { BadgeItem } from "./badge-item";

interface UserBadgesProps {
  userId: string;
  seasonId: string | null;
}

const UserBadges = async ({ userId, seasonId }: UserBadgesProps) => {
  const badges = await getUserBadges(userId, seasonId ?? undefined);

  return (
    <Card className="p-4 mt-4">
      <CardTitle className="text-lg mb-4">獲得バッジ</CardTitle>
      {badges.length === 0 ? (
        <div className="text-center py-4 text-sm text-muted-foreground">
          まだバッジを獲得していません
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <BadgeItem key={badge.id} badge={badge} />
          ))}
        </div>
      )}
    </Card>
  );
};

export default UserBadges;

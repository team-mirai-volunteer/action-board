import { getCurrentSeasonId } from "@/lib/services/seasons";
import { getUserTopBadge } from "../services/get-user-top-badges";
import { BadgeItem } from "./badge-item";

interface UserTopBadgeProps {
  userId: string;
  seasonId?: string;
}

export async function UserTopBadge({ userId, seasonId }: UserTopBadgeProps) {
  // seasonIdが指定されていない場合は現在のシーズンIDを取得
  const targetSeasonId = seasonId || (await getCurrentSeasonId());
  const topBadge = await getUserTopBadge(userId, targetSeasonId || undefined);

  if (!topBadge) {
    return null;
  }

  return <BadgeItem badge={topBadge} className="w-fit" clickable={false} />;
}

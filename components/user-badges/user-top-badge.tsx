import { getUserTopBadge } from "@/lib/services/badges";
import { BadgeDisplay } from "./badge-display";

interface UserTopBadgeProps {
  userId: string;
}

export async function UserTopBadge({ userId }: UserTopBadgeProps) {
  const topBadge = await getUserTopBadge(userId);

  if (!topBadge) {
    return null;
  }

  return <BadgeDisplay badge={topBadge} className="w-fit" />;
}

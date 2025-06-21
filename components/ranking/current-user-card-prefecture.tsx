import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserRanking } from "@/lib/services/ranking";
import {
  formatUserDisplayName,
  formatUserPrefecture,
} from "@/lib/utils/ranking-utils";
import { User } from "lucide-react";
import { LevelBadge } from "./ranking-level-badge";

interface CurrentUserCardProps {
  currentUser: UserRanking | null;
  prefecture: string;
}

export const CurrentUserCardPrefecture: React.FC<CurrentUserCardProps> = ({
  currentUser,
  prefecture,
}) => {
  if (!currentUser) {
    return null;
  }
  const displayUser = {
    ...currentUser,
    rank: currentUser.rank || 0,
    name: formatUserDisplayName(currentUser.name),
    address_prefecture: formatUserPrefecture(currentUser.address_prefecture),
    level: currentUser.level || 0,
    xp: currentUser.xp || 0,
  };
  return (
    <div className="px-4">
      <Card className="border-teal-200 bg-teal-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-teal-600" />
            あなたのランク
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-teal-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {displayUser.rank}
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  {formatUserDisplayName(displayUser.name)}
                </div>
                <div className="text-sm text-gray-600">
                  {formatUserPrefecture(displayUser.address_prefecture)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <LevelBadge level={displayUser.level} />
                <div className="text-lg font-bold">
                  {displayUser.xp.toLocaleString()}pt
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserMissionRanking } from "@/lib/services/missionsRanking";
import type { Tables } from "@/lib/types/supabase";
import {
  formatUserDisplayName,
  formatUserPrefecture,
} from "@/lib/utils/ranking-utils";
import { User } from "lucide-react";
import { Badge } from "../ui/badge";

interface CurrentUserCardProps {
  currentUser: UserMissionRanking | null;
  mission: Tables<"missions">;
  userPostingCount?: number;
  postingMission?: boolean;
}

export const CurrentUserCardMission: React.FC<CurrentUserCardProps> = ({
  currentUser,
  mission,
  userPostingCount,
  postingMission,
}) => {
  if (!currentUser) {
    return null;
  }
  const displayUser = {
    ...currentUser,
    rank: currentUser.rank || 0,
    name: formatUserDisplayName(currentUser.name),
    address_prefecture: formatUserPrefecture(currentUser.address_prefecture),
  };

  return (
    <div className="max-w-6xl mx-auto">
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
            <div className="flex items-center gap-3">
              <Badge
                className={
                  "bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full"
                }
              >
                {(postingMission
                  ? (userPostingCount ?? 0)
                  : (displayUser?.user_achievement_count ?? 0)
                ).toLocaleString()}
                {postingMission ? "枚" : "回"}
              </Badge>
              <span className="font-bold text-lg">
                {(displayUser.total_points ?? 0).toLocaleString()}pt
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

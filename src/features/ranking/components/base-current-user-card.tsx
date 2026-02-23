import { User } from "lucide-react";
import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserNameWithBadge } from "@/features/party-membership/components/user-name-with-badge";
import type { PartyMembership } from "@/features/party-membership/types";
import { getLevelBadgeColor } from "../utils/level-badge-styles";
import {
  formatUserDisplayName,
  formatUserPrefecture,
} from "../utils/ranking-utils";

interface BaseCurrentUserCardProps {
  currentUser: {
    user_id: string;
    name: string | null;
    address_prefecture: string | null;
    rank: number | null;
    party_membership?: PartyMembership | null;
  } | null;
  title?: string;
  level?: number;
  children: React.ReactNode;
}

export const BaseCurrentUserCard: React.FC<BaseCurrentUserCardProps> = ({
  currentUser,
  title = "あなたのランク",
  level,
  children,
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
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-teal-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {displayUser.rank}
              </div>
              <div>
                <UserNameWithBadge
                  name={displayUser.name}
                  membership={currentUser.party_membership ?? null}
                  nameClassName="font-semibold text-gray-900"
                  badgeSize={18}
                />
                <div className="text-sm text-gray-600">
                  {displayUser.address_prefecture}
                  {level != null && (
                    <span
                      className={`ml-1.5 ${getLevelBadgeColor(level)} px-1.5 py-0.5 rounded text-xs font-medium`}
                    >
                      Lv.{level}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">{children}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

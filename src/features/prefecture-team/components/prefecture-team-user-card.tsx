import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  PrefectureTeamRanking,
  UserPrefectureContribution,
} from "../types/prefecture-team-types";
import { PrefectureTeamUserCardContent } from "./prefecture-team-user-card-content";

interface PrefectureTeamUserCardProps {
  prefectureRanking: PrefectureTeamRanking;
  userContribution: UserPrefectureContribution;
}

export function PrefectureTeamUserCard({
  prefectureRanking,
  userContribution,
}: PrefectureTeamUserCardProps) {
  return (
    <Card className="">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-gray-500 font-medium">
          <MapPin className="w-5 h-5 text-teal-600" />
          あなたの都道府県
        </CardTitle>
      </CardHeader>
      <CardContent>
        <PrefectureTeamUserCardContent
          prefectureRanking={prefectureRanking}
          userContribution={userContribution}
        />
      </CardContent>
    </Card>
  );
}

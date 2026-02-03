import { MapPin } from "lucide-react";
import Link from "next/link";
import { UserNameWithBadge } from "@/features/party-membership/components/user-name-with-badge";
import { getPartyMembership } from "@/features/party-membership/services/memberships";
import { UserTopBadge } from "@/features/user-badges/components/user-top-badge";
import { LevelProgress } from "@/features/user-level/components/level-progress";
import { getUserLevel } from "@/features/user-level/services/level";
import UserAvatar from "@/features/user-profile/components/user-avatar";
import { getProfile } from "@/features/user-profile/services/profile";

interface LevelsProps {
  userId: string;
  hideProgress?: boolean;
  clickable?: boolean;
  showBadge?: boolean;
  seasonId?: string;
}

// TODO: UserProfileCardにリネーム
export default async function Levels({
  userId,
  hideProgress = false,
  clickable = false,
  showBadge = false,
  seasonId,
}: LevelsProps) {
  const profile = await getProfile(userId);

  if (!profile) {
    throw new Error("Private user data not found");
  }

  const userLevel = await getUserLevel(userId, seasonId);
  const partyMembership = await getPartyMembership(userId);

  const cardContent = (
    <div
      className={`w-full flex flex-col items-stretch bg-white rounded-md p-6 ${clickable ? "hover:bg-gray-50 transition-colors max-w-lg" : "max-w-md"}`}
    >
      <div className="flex items-center">
        <UserAvatar userProfile={profile} size="lg" />
        <div className="flex flex-col ml-6 min-w-0">
          <UserNameWithBadge
            name={profile.name}
            membership={partyMembership}
            nameClassName="text-lg font-bold"
            badgeSize={22}
          />
          <div className="flex items-center mt-2">
            <div className="flex items-baseline">
              <div className="text-sm font-bold">LV.</div>
              <div className="text-xxl font-bold ml-1 leading-none">
                {userLevel ? userLevel.level : "1"}
              </div>
            </div>
            <div className="flex ml-4 text-sm items-center">
              <MapPin className="w-4 h-4 mr-0.5" />
              {profile.address_prefecture}
            </div>
          </div>
          <div className="flex items-center mt-2 text-sm text-gray-600">
            <div>
              {userLevel ? userLevel.xp.toLocaleString() : "0"} ポイント
            </div>
          </div>
        </div>
      </div>
      {showBadge && (
        <div className="mt-3">
          <UserTopBadge userId={userId} seasonId={seasonId} />
        </div>
      )}
      {!hideProgress && (
        <div className="mt-4 flex flex-col items-start">
          <LevelProgress userLevel={userLevel} />
        </div>
      )}
    </div>
  );

  if (clickable) {
    return (
      <section className="bg-gradient-hero flex justify-center py-6 px-4">
        <Link
          href={`/users/${userId}`}
          aria-label={`${profile.name}さんのプロフィールへ`}
          className="w-full max-w-xl flex justify-center"
        >
          {cardContent}
        </Link>
      </section>
    );
  }

  return (
    <section className="bg-gradient-hero flex justify-center py-6 px-4">
      {cardContent}
    </section>
  );
}

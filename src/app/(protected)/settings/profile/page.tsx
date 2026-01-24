import type { Message } from "@/components/common/form-message";
import { PartyBadgeVisibilityToggle } from "@/features/party-membership/components/party-badge-visibility-toggle";
import { getPartyMembership } from "@/features/party-membership/services/memberships";
import { TikTokIcon } from "@/features/tiktok/components";
import {
  getMyProfile,
  getProfile,
  getUser,
} from "@/features/user-profile/services/profile";
import { AccountDeletionSection } from "@/features/user-settings/components/account-deletion-section";
import ProfileForm from "@/features/user-settings/components/profile-form";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

type ProfileSettingsPageSearchParams = {
  new: string;
} & Message;

export default async function ProfileSettingsPage({
  searchParams,
}: {
  searchParams: Promise<ProfileSettingsPageSearchParams | undefined>;
}) {
  const params = await searchParams;

  const user = await getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // ユーザー情報を取得
  const privateUser = await getMyProfile();
  const publicUser = await getProfile(user.id);
  const partyMembership = await getPartyMembership(user.id);

  // 新規ユーザーかどうか判定
  const isNew = Boolean(params?.new);

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <ProfileForm
        message={params}
        isNew={isNew}
        initialProfile={{
          name: publicUser?.name || user.user_metadata.name || "",
          address_prefecture: publicUser?.address_prefecture || "",
          date_of_birth:
            privateUser?.date_of_birth ?? user.user_metadata.date_of_birth,
          x_username: publicUser?.x_username || null,
          github_username: publicUser?.github_username || null,
          avatar_url: publicUser?.avatar_url || null,
        }}
        initialPrivateUser={privateUser}
        partyMembership={partyMembership}
        email={user.email || null}
      />

      {partyMembership && (
        <div className="pt-4 border-gray-200 space-y-3">
          <PartyBadgeVisibilityToggle membership={partyMembership} />
        </div>
      )}

      {/* TikTok連携（環境変数がある場合のみ表示） */}
      {process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY && (
        <div className="w-full max-w-md mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            外部サービス連携
          </h3>
          <Link
            href="/settings/tiktok"
            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <TikTokIcon className="w-5 h-5" />
              <span className="text-sm font-medium text-gray-900">
                TikTok連携
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
        </div>
      )}

      {!isNew && <AccountDeletionSection />}
    </div>
  );
}

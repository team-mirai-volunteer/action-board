import type { Message } from "@/components/common/form-message";
import {
  getMyProfile,
  getProfile,
  getUser,
} from "@/features/user-profile/services/profile";
import { AccountDeletionSection } from "@/features/user-settings/components/account-deletion-section";
import ProfileForm from "@/features/user-settings/components/profile-form";
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
  const privateUser = await getMyProfile().catch(() => null);
  const publicUser = await getProfile(user.id);

  // 新規ユーザーかどうか判定
  const isNew = Boolean(params?.new);

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <ProfileForm
        message={params}
        isNew={isNew}
        initialProfile={{
          name: privateUser?.name || user.user_metadata.name || "",
          address_prefecture: privateUser?.address_prefecture || "",
          date_of_birth:
            privateUser?.date_of_birth ?? user.user_metadata.date_of_birth,
          x_username: privateUser?.x_username || null,
          github_username: publicUser?.github_username || null,
          avatar_url: privateUser?.avatar_url || null,
        }}
        initialPrivateUser={privateUser}
      />
      {!isNew && <AccountDeletionSection />}
    </div>
  );
}

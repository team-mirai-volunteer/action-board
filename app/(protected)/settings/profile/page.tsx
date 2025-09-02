import type { Message } from "@/components/form-message";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccountDeletionSection } from "./AccountDeletionSection";
import ProfileForm from "./ProfileForm";

export const runtime = "edge";

type ProfileSettingsPageSearchParams = {
  new: string;
} & Message;

export default async function ProfileSettingsPage({
  searchParams,
}: {
  searchParams: Promise<ProfileSettingsPageSearchParams | undefined>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // ユーザー情報を取得
  const { data: privateUser } = await supabase
    .from("private_users")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: publicUser } = await supabase
    .from("public_user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

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

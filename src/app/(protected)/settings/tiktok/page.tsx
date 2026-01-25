import { getTikTokLinkStatusAction } from "@/features/tiktok/actions/tiktok-video-actions";
import { getUser } from "@/features/user-profile/services/profile";
import { redirect } from "next/navigation";
import { TikTokSettingsContent } from "./tiktok-settings-content";

export default async function TikTokSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ linked?: string } | undefined>;
}) {
  const user = await getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const params = await searchParams;
  const justLinked = params?.linked === "true";

  // TikTok連携状態を取得
  const linkStatus = await getTikTokLinkStatusAction();

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">TikTok連携設定</h1>

      {justLinked && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            TikTokアカウントの連携が完了しました。「動画を同期」ボタンを押して、#チームみらい動画を取得してください。
          </p>
        </div>
      )}

      <TikTokSettingsContent
        isLinked={linkStatus.isLinked}
        tiktokDisplayName={linkStatus.tiktokDisplayName}
        tiktokAvatarUrl={linkStatus.tiktokAvatarUrl}
        linkedAt={linkStatus.linkedAt}
      />
    </div>
  );
}

import { redirect } from "next/navigation";
import { getUser } from "@/features/user-profile/services/profile";
import { getYouTubeLinkStatusAction } from "@/features/youtube/actions/youtube-video-actions";
import { YouTubeSettingsContent } from "./youtube-settings-content";

export default async function YouTubeSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ linked?: string; tab?: string } | undefined>;
}) {
  const user = await getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const params = await searchParams;
  const justLinked = params?.linked === "true";
  const activeTab = params?.tab || "likes";

  // YouTube連携状態を取得
  const linkStatus = await getYouTubeLinkStatusAction();

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">YouTube連携設定</h1>

      {justLinked && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            YouTubeアカウントの連携が完了しました。あなたの #チームみらい
            動画が表示されます。
          </p>
        </div>
      )}

      <YouTubeSettingsContent
        isLinked={linkStatus.isLinked}
        channelTitle={linkStatus.channelTitle}
        thumbnailUrl={linkStatus.thumbnailUrl}
        linkedAt={linkStatus.linkedAt}
        defaultTab={activeTab}
      />
    </div>
  );
}

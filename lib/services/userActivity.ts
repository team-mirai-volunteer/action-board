import { createServiceClient } from "@/lib/supabase/server";

/**
 * ユーザーアクティビティを記録する
 * @param userId ユーザーID
 * @param activityType アクティビティタイプ（signup, level_up など）
 * @param activityTitle アクティビティのタイトル
 */
export async function recordUserActivity(
  userId: string,
  activityType: string,
  activityTitle: string,
): Promise<void> {
  const supabase = await createServiceClient();

  const { error } = await supabase.from("user_activities").insert({
    user_id: userId,
    activity_type: activityType,
    activity_title: activityTitle,
  });

  if (error) {
    console.error("Failed to record user activity:", error);
    throw new Error("ユーザーアクティビティの記録に失敗しました");
  }
}

/**
 * サインアップアクティビティを記録する
 * @param userId ユーザーID
 * @param userName ユーザー名
 */
export async function recordSignupActivity(
  userId: string,
  userName: string,
): Promise<void> {
  const supabase = await createServiceClient();

  // 既存のサインアップアクティビティをチェック
  const { data: existingActivity } = await supabase
    .from("user_activities")
    .select("id")
    .eq("user_id", userId)
    .eq("activity_type", "signup")
    .maybeSingle();

  // 既にサインアップアクティビティが存在する場合は何もしない
  if (existingActivity) {
    console.log(`Signup activity already exists for user ${userId}`);
    return;
  }

  // 新規の場合のみサインアップアクティビティを記録
  await recordUserActivity(
    userId,
    "signup",
    `${userName}さんが仲間入れしました！`,
  );
}

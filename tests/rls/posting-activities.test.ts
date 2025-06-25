import type { Database } from "@/lib/types/supabase";
import {
  adminClient,
  cleanupTestUser,
  createTestUser,
  getAnonClient,
} from "./utils";

describe("posting_activities テーブルのRLSテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;
  let missionId: string;
  let missionArtifactId: string;
  let postingActivityId: string;
  let achievementId: string;

  beforeEach(async () => {
    // テストユーザーを作成
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    user2 = await createTestUser(`${crypto.randomUUID()}@example.com`);

    // テスト用ミッションを作成（管理者権限で）
    const missionData = {
      id: crypto.randomUUID(),
      title: "ポスティングミッション for RLS",
      content: "これはRLSテスト用のポスティングミッションです",
      difficulty: 1,
      required_artifact_type: "POSTING" as const,
      slug: `test-posting-mission-${crypto.randomUUID()}`,
    };

    const { error: missionError } = await adminClient
      .from("missions")
      .insert(missionData);
    if (missionError) {
      throw new Error(`ミッション作成エラー: ${missionError.message}`);
    }
    missionId = missionData.id;

    // テスト用の達成記録を作成（user1として）
    const achievementData = {
      id: crypto.randomUUID(),
      mission_id: missionId,
      user_id: user1.user.userId,
    };

    const { error: achievementError } = await adminClient
      .from("achievements")
      .insert(achievementData);
    if (achievementError) {
      throw new Error(`達成記録作成エラー: ${achievementError.message}`);
    }
    achievementId = achievementData.id;

    // テスト用の成果物を作成（user1として）
    const artifactData = {
      id: crypto.randomUUID(),
      achievement_id: achievementId,
      user_id: user1.user.userId,
      artifact_type: "POSTING" as const,
      text_content: "10枚を東京都渋谷区に配布",
    };

    const { error: artifactError } = await adminClient
      .from("mission_artifacts")
      .insert(artifactData);
    if (artifactError) {
      throw new Error(`成果物作成エラー: ${artifactError.message}`);
    }
    missionArtifactId = artifactData.id;

    // テスト用のポスティング活動を作成
    const postingData = {
      id: crypto.randomUUID(),
      mission_artifact_id: missionArtifactId,
      posting_count: 10,
      location_text: "東京都渋谷区",
    };

    const { error: postingError } = await adminClient
      .from("posting_activities")
      .insert(postingData);
    if (postingError) {
      throw new Error(`ポスティング活動作成エラー: ${postingError.message}`);
    }
    postingActivityId = postingData.id;
  });

  afterEach(async () => {
    // テストデータをクリーンアップ
    await adminClient
      .from("posting_activities")
      .delete()
      .eq("id", postingActivityId);
    await adminClient
      .from("mission_artifacts")
      .delete()
      .eq("id", missionArtifactId);
    await adminClient.from("achievements").delete().eq("id", achievementId);
    await adminClient.from("missions").delete().eq("id", missionId);
    await cleanupTestUser(user1.user.userId);
    await cleanupTestUser(user2.user.userId);
  });

  test("匿名ユーザーはポスティング活動を読み取れない", async () => {
    const anonClient = getAnonClient();
    const { data, error } = await anonClient
      .from("posting_activities")
      .select("*");

    expect(data?.length).toBe(0);
  });

  test("認証済みユーザーは自分のポスティング活動のみ読み取れる", async () => {
    // user1は自分のポスティング活動を読み取れる
    const { data: user1Data, error: user1Error } = await user1.client
      .from("posting_activities")
      .select("*")
      .eq("id", postingActivityId);

    expect(user1Error).toBeNull();
    expect(user1Data).toHaveLength(1);
    expect(user1Data?.[0].id).toBe(postingActivityId);

    // user2は他人のポスティング活動を読み取れない
    const { data: user2Data, error: user2Error } = await user2.client
      .from("posting_activities")
      .select("*")
      .eq("id", postingActivityId);

    expect(user2Error).toBeNull();
    expect(user2Data).toHaveLength(0);
  });

  test("認証済みユーザーは自分のポスティング活動のみ作成できる", async () => {
    // user1は自分の成果物に対してポスティング活動を作成できる
    const newPostingData = {
      id: crypto.randomUUID(),
      mission_artifact_id: missionArtifactId,
      posting_count: 5,
      location_text: "東京都新宿区",
    };

    const { data: insertData, error: insertError } = await user1.client
      .from("posting_activities")
      .insert(newPostingData)
      .select();

    expect(insertError).toBeNull();
    expect(insertData).toHaveLength(1);
    expect(insertData?.[0].posting_count).toBe(5);

    // クリーンアップ
    await adminClient
      .from("posting_activities")
      .delete()
      .eq("id", newPostingData.id);
  });

  test("認証済みユーザーは他人の成果物に対してポスティング活動を作成できない", async () => {
    // user2の達成記録を作成
    const user2AchievementData = {
      id: crypto.randomUUID(),
      mission_id: missionId,
      user_id: user2.user.userId,
    };

    const { error: user2AchievementError } = await adminClient
      .from("achievements")
      .insert(user2AchievementData);
    if (user2AchievementError) {
      throw new Error(
        `user2達成記録作成エラー: ${user2AchievementError.message}`,
      );
    }

    // user2の成果物を作成
    const user2ArtifactData = {
      id: crypto.randomUUID(),
      achievement_id: user2AchievementData.id,
      user_id: user2.user.userId,
      artifact_type: "POSTING" as const,
      text_content: "5枚を大阪府大阪市に配布",
    };

    const { error: user2ArtifactError } = await adminClient
      .from("mission_artifacts")
      .insert(user2ArtifactData);
    if (user2ArtifactError) {
      throw new Error(`user2成果物作成エラー: ${user2ArtifactError.message}`);
    }

    // user1がuser2の成果物に対してポスティング活動を作成しようとする
    const invalidPostingData = {
      id: crypto.randomUUID(),
      mission_artifact_id: user2ArtifactData.id,
      posting_count: 3,
      location_text: "東京都品川区",
    };

    const { data: insertData, error: insertError } = await user1.client
      .from("posting_activities")
      .insert(invalidPostingData)
      .select();

    // RLSによって挿入が拒否される
    expect(insertError).toBeTruthy();
    expect(insertData).toBeNull();

    // クリーンアップ
    await adminClient
      .from("achievements")
      .delete()
      .eq("id", user2AchievementData.id);
    await adminClient
      .from("mission_artifacts")
      .delete()
      .eq("id", user2ArtifactData.id);
  });

  test("認証済みユーザーは自分のポスティング活動のみ更新できる", async () => {
    // user1は自分のポスティング活動を更新できる
    const { data: updateData, error: updateError } = await user1.client
      .from("posting_activities")
      .update({
        posting_count: 15,
        location_text: "東京都渋谷区道玄坂",
      })
      .eq("id", postingActivityId)
      .select();

    expect(updateError).toBeNull();
    expect(updateData).toHaveLength(1);
    expect(updateData?.[0].posting_count).toBe(15);

    // user2は他人のポスティング活動を更新できない
    const { data: user2UpdateData, error: user2UpdateError } =
      await user2.client
        .from("posting_activities")
        .update({
          posting_count: 20,
        })
        .eq("id", postingActivityId)
        .select();

    expect(user2UpdateError).toBeNull();
    expect(user2UpdateData).toHaveLength(0); // 更新されたレコードなし
  });

  test("認証済みユーザーは自分のポスティング活動のみ削除できる", async () => {
    // 削除テスト用のポスティング活動を作成
    const deleteTestData = {
      id: crypto.randomUUID(),
      mission_artifact_id: missionArtifactId,
      posting_count: 3,
      location_text: "東京都港区",
    };

    const { error: createError } = await adminClient
      .from("posting_activities")
      .insert(deleteTestData);
    if (createError) {
      throw new Error(`削除テスト用データ作成エラー: ${createError.message}`);
    }

    // user2は他人のポスティング活動を削除できない
    const { data: user2DeleteData, error: user2DeleteError } =
      await user2.client
        .from("posting_activities")
        .delete()
        .eq("id", deleteTestData.id)
        .select();

    expect(user2DeleteError).toBeNull();
    expect(user2DeleteData).toHaveLength(0); // 削除されたレコードなし

    // user1は自分のポスティング活動を削除できる
    const { data: deleteData, error: deleteError } = await user1.client
      .from("posting_activities")
      .delete()
      .eq("id", deleteTestData.id)
      .select();

    expect(deleteError).toBeNull();
    expect(deleteData).toHaveLength(1);
    expect(deleteData?.[0].id).toBe(deleteTestData.id);
  });
});

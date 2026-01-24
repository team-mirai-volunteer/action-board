import type { Database } from "@/lib/types/supabase";
import {
  adminClient,
  cleanupTestUser,
  createTestUser,
  getAnonClient,
} from "../utils";

describe("poster_activities テーブルのRLSテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;
  let missionId: string;
  let missionArtifactId: string;
  let posterActivityId: string;
  let achievementId: string;

  beforeEach(async () => {
    // テストユーザーを作成
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    user2 = await createTestUser(`${crypto.randomUUID()}@example.com`);

    // テスト用ミッションを作成（管理者権限で）
    const missionData = {
      id: crypto.randomUUID(),
      title: "ポスターミッション for RLS",
      content: "これはRLSテスト用のポスターミッションです",
      difficulty: 1,
      required_artifact_type: "POSTER" as const,
      slug: `test-poster-mission-${crypto.randomUUID()}`,
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
      artifact_type: "POSTER" as const,
      text_content: "5枚を東京都渋谷区 A-1に貼付",
    };

    const { error: artifactError } = await adminClient
      .from("mission_artifacts")
      .insert(artifactData);
    if (artifactError) {
      throw new Error(`成果物作成エラー: ${artifactError.message}`);
    }
    missionArtifactId = artifactData.id;

    // テスト用のポスター活動を作成
    const posterData = {
      id: crypto.randomUUID(),
      user_id: user1.user.userId,
      mission_artifact_id: missionArtifactId,
      poster_count: 5,
      prefecture:
        "東京都" as Database["public"]["Enums"]["poster_prefecture_enum"],
      city: "渋谷区",
      number: "10-3",
      name: "渋谷駅前掲示板",
      note: "正常に貼付完了",
      address: "東京都渋谷区道玄坂1-1",
      lat: 35.6598,
      long: 139.7006,
    };

    const { error: posterError } = await adminClient
      .from("poster_activities")
      .insert(posterData);
    if (posterError) {
      throw new Error(`ポスター活動作成エラー: ${posterError.message}`);
    }
    posterActivityId = posterData.id;
  });

  afterEach(async () => {
    // テストデータをクリーンアップ
    await adminClient
      .from("poster_activities")
      .delete()
      .eq("id", posterActivityId);
    await adminClient
      .from("mission_artifacts")
      .delete()
      .eq("id", missionArtifactId);
    await adminClient.from("achievements").delete().eq("id", achievementId);
    await adminClient.from("missions").delete().eq("id", missionId);
    await cleanupTestUser(user1.user.userId);
    await cleanupTestUser(user2.user.userId);
  });

  test("匿名ユーザーはポスター活動を読み取れない", async () => {
    const anonClient = getAnonClient();
    const { data, error } = await anonClient
      .from("poster_activities")
      .select("*");

    expect(data?.length).toBe(0);
  });

  test("認証済みユーザーは自分のポスター活動のみ読み取れる", async () => {
    // user1は自分のポスター活動を読み取れる
    const { data: user1Data, error: user1Error } = await user1.client
      .from("poster_activities")
      .select("*")
      .eq("id", posterActivityId);

    expect(user1Error).toBeNull();
    expect(user1Data).toHaveLength(1);
    expect(user1Data?.[0].id).toBe(posterActivityId);
    expect(user1Data?.[0].poster_count).toBe(5);
    expect(user1Data?.[0].prefecture).toBe("東京都");
    expect(user1Data?.[0].city).toBe("渋谷区");
    expect(user1Data?.[0].number).toBe("10-3");

    // user2は他人のポスター活動を読み取れない
    const { data: user2Data, error: user2Error } = await user2.client
      .from("poster_activities")
      .select("*")
      .eq("id", posterActivityId);

    expect(user2Error).toBeNull();
    expect(user2Data).toHaveLength(0);
  });

  test("認証済みユーザーは自分のポスター活動のみ作成できる", async () => {
    // user1は自分の成果物に対してポスター活動を作成できる
    const newPosterData = {
      id: crypto.randomUUID(),
      user_id: user1.user.userId,
      mission_artifact_id: missionArtifactId,
      poster_count: 3,
      prefecture:
        "東京都" as Database["public"]["Enums"]["poster_prefecture_enum"],
      city: "新宿区",
      number: "1-5",
      name: "新宿駅西口掲示板",
      address: "東京都新宿区西新宿1-1",
      lat: 35.6896,
      long: 139.6917,
    };

    const { data: insertData, error: insertError } = await user1.client
      .from("poster_activities")
      .insert(newPosterData)
      .select();

    expect(insertError).toBeNull();
    expect(insertData).toHaveLength(1);
    expect(insertData?.[0].poster_count).toBe(3);
    expect(insertData?.[0].prefecture).toBe("東京都");
    expect(insertData?.[0].city).toBe("新宿区");
    expect(insertData?.[0].number).toBe("1-5");

    // クリーンアップ
    await adminClient
      .from("poster_activities")
      .delete()
      .eq("id", newPosterData.id);
  });

  test("認証済みユーザーは他人の成果物に対してポスター活動を作成できない", async () => {
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
      artifact_type: "POSTER" as const,
      text_content: "2枚を大阪府大阪市 C-10に貼付",
    };

    const { error: user2ArtifactError } = await adminClient
      .from("mission_artifacts")
      .insert(user2ArtifactData);
    if (user2ArtifactError) {
      throw new Error(`user2成果物作成エラー: ${user2ArtifactError.message}`);
    }

    // user1がuser2のuser_idを使ってポスター活動を作成しようとする（これはRLSで弾かれる）
    const invalidPosterData = {
      id: crypto.randomUUID(),
      user_id: user2.user.userId, // user2のIDを使用（RLSで弾かれるはず）
      mission_artifact_id: user2ArtifactData.id,
      poster_count: 2,
      prefecture:
        "大阪府" as Database["public"]["Enums"]["poster_prefecture_enum"],
      city: "大阪市",
      number: "1-10",
    };

    // user1クライアントでuser2のuser_idを指定して挿入を試みる
    const { data: insertData, error: insertError } = await user1.client
      .from("poster_activities")
      .insert(invalidPosterData)
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

  test("認証済みユーザーは自分のポスター活動のみ更新できる", async () => {
    // user1は自分のポスター活動を更新できる
    const { data: updateData, error: updateError } = await user1.client
      .from("poster_activities")
      .update({
        poster_count: 8,
        note: "更新：追加でポスターを貼付",
        address: "東京都渋谷区道玄坂1-1-1",
      })
      .eq("id", posterActivityId)
      .select();

    expect(updateError).toBeNull();
    expect(updateData).toHaveLength(1);
    expect(updateData?.[0].poster_count).toBe(8);
    expect(updateData?.[0].note).toBe("更新：追加でポスターを貼付");

    // user2は他人のポスター活動を更新できない
    const { data: user2UpdateData, error: user2UpdateError } =
      await user2.client
        .from("poster_activities")
        .update({
          poster_count: 10,
        })
        .eq("id", posterActivityId)
        .select();

    expect(user2UpdateError).toBeNull();
    expect(user2UpdateData).toHaveLength(0); // 更新されたレコードなし
  });

  test("認証済みユーザーは自分のポスター活動のみ削除できる", async () => {
    // 削除テスト用のポスター活動を作成
    const deleteTestData = {
      id: crypto.randomUUID(),
      user_id: user1.user.userId,
      mission_artifact_id: missionArtifactId,
      poster_count: 2,
      prefecture:
        "東京都" as Database["public"]["Enums"]["poster_prefecture_enum"],
      city: "港区",
      number: "10-3",
      name: "品川駅前掲示板",
    };

    const { error: createError } = await adminClient
      .from("poster_activities")
      .insert(deleteTestData);
    if (createError) {
      throw new Error(`削除テスト用データ作成エラー: ${createError.message}`);
    }

    // user2は他人のポスター活動を削除できない
    const { data: user2DeleteData, error: user2DeleteError } =
      await user2.client
        .from("poster_activities")
        .delete()
        .eq("id", deleteTestData.id)
        .select();

    expect(user2DeleteError).toBeNull();
    expect(user2DeleteData).toHaveLength(0); // 削除されたレコードなし

    // user1は自分のポスター活動を削除できる
    const { data: deleteData, error: deleteError } = await user1.client
      .from("poster_activities")
      .delete()
      .eq("id", deleteTestData.id)
      .select();

    expect(deleteError).toBeNull();
    expect(deleteData).toHaveLength(1);
    expect(deleteData?.[0].id).toBe(deleteTestData.id);
  });

  test("必須フィールドのバリデーション", async () => {
    // poster_countが0以下の場合
    const invalidPosterData1 = {
      id: crypto.randomUUID(),
      user_id: user1.user.userId,
      mission_artifact_id: missionArtifactId,
      poster_count: 0, // 無効な値
      prefecture:
        "東京都" as Database["public"]["Enums"]["poster_prefecture_enum"],
      city: "港区",
      number: "10-3",
    };

    const { error: error1 } = await user1.client
      .from("poster_activities")
      .insert(invalidPosterData1);

    expect(error1).toBeTruthy();

    // cityがnullの場合（NOT NULL制約）
    const invalidPosterData2 = {
      id: crypto.randomUUID(),
      user_id: user1.user.userId,
      mission_artifact_id: missionArtifactId,
      poster_count: 1,
      prefecture:
        "東京都" as Database["public"]["Enums"]["poster_prefecture_enum"],
      city: null as any, // null値でNOT NULL制約をテスト
      number: "1-2",
    };

    const { error: error2 } = await user1.client
      .from("poster_activities")
      .insert(invalidPosterData2);

    expect(error2).toBeTruthy();

    // numberがnullの場合（NOT NULL制約）
    const invalidPosterData3 = {
      id: crypto.randomUUID(),
      user_id: user1.user.userId,
      mission_artifact_id: missionArtifactId,
      poster_count: 1,
      prefecture:
        "東京都" as Database["public"]["Enums"]["poster_prefecture_enum"],
      city: "港区",
      number: null as any, // null値でNOT NULL制約をテスト
    };

    const { error: error3 } = await user1.client
      .from("poster_activities")
      .insert(invalidPosterData3);

    expect(error3).toBeTruthy();
  });

  test("文字数制限のチェック", async () => {
    // cityが100文字を超える場合
    const longCity = "a".repeat(101);
    const invalidPosterData1 = {
      id: crypto.randomUUID(),
      user_id: user1.user.userId,
      mission_artifact_id: missionArtifactId,
      poster_count: 1,
      prefecture:
        "東京都" as Database["public"]["Enums"]["poster_prefecture_enum"],
      city: longCity,
      number: "1-1",
    };

    const { error: error1 } = await user1.client
      .from("poster_activities")
      .insert(invalidPosterData1);

    expect(error1).toBeTruthy();

    // numberが20文字を超える場合
    const longNumber = "a".repeat(21);
    const invalidPosterData2 = {
      id: crypto.randomUUID(),
      user_id: user1.user.userId,
      mission_artifact_id: missionArtifactId,
      poster_count: 1,
      prefecture:
        "東京都" as Database["public"]["Enums"]["poster_prefecture_enum"],
      city: "港区",
      number: longNumber,
    };

    const { error: error2 } = await user1.client
      .from("poster_activities")
      .insert(invalidPosterData2);

    expect(error2).toBeTruthy();

    // nameが100文字を超える場合
    const longName = "a".repeat(101);
    const invalidPosterData3 = {
      id: crypto.randomUUID(),
      user_id: user1.user.userId,
      mission_artifact_id: missionArtifactId,
      poster_count: 1,
      prefecture:
        "東京都" as Database["public"]["Enums"]["poster_prefecture_enum"],
      city: "港区",
      number: "2-3",
      name: longName,
    };

    const { error: error3 } = await user1.client
      .from("poster_activities")
      .insert(invalidPosterData3);

    expect(error3).toBeTruthy();

    // noteが200文字を超える場合
    const longNote = "a".repeat(201);
    const invalidPosterData4 = {
      id: crypto.randomUUID(),
      user_id: user1.user.userId,
      mission_artifact_id: missionArtifactId,
      poster_count: 1,
      prefecture:
        "東京都" as Database["public"]["Enums"]["poster_prefecture_enum"],
      city: "港区",
      number: "18-4",
      note: longNote,
    };

    const { error: error4 } = await user1.client
      .from("poster_activities")
      .insert(invalidPosterData4);

    expect(error4).toBeTruthy();

    // addressが200文字を超える場合
    const longAddress = "a".repeat(201);
    const invalidPosterData5 = {
      id: crypto.randomUUID(),
      user_id: user1.user.userId,
      mission_artifact_id: missionArtifactId,
      poster_count: 1,
      prefecture:
        "東京都" as Database["public"]["Enums"]["poster_prefecture_enum"],
      city: "港区",
      number: "5-8",
      address: longAddress,
    };

    const { error: error5 } = await user1.client
      .from("poster_activities")
      .insert(invalidPosterData5);

    expect(error5).toBeTruthy();
  });

  test("オプショナルフィールドがnullでも正常に作成できる", async () => {
    const minimalPosterData = {
      id: crypto.randomUUID(),
      user_id: user1.user.userId,
      mission_artifact_id: missionArtifactId,
      poster_count: 1,
      prefecture:
        "東京都" as Database["public"]["Enums"]["poster_prefecture_enum"],
      city: "港区",
      number: "10-3",
      // name, note, address, lat, longはnull
    };

    const { data: insertData, error: insertError } = await user1.client
      .from("poster_activities")
      .insert(minimalPosterData)
      .select();

    expect(insertError).toBeNull();
    expect(insertData).toHaveLength(1);
    expect(insertData?.[0].poster_count).toBe(1);
    expect(insertData?.[0].prefecture).toBe("東京都");
    expect(insertData?.[0].city).toBe("港区");
    expect(insertData?.[0].number).toBe("10-3");
    expect(insertData?.[0].name).toBeNull();
    expect(insertData?.[0].note).toBeNull();
    expect(insertData?.[0].address).toBeNull();
    expect(insertData?.[0].lat).toBeNull();
    expect(insertData?.[0].long).toBeNull();

    // クリーンアップ
    await adminClient
      .from("poster_activities")
      .delete()
      .eq("id", minimalPosterData.id);
  });
});

import {
  adminClient,
  cleanupTestUser,
  createTestUser,
  getAnonClient,
} from "../utils";

describe("youtube_video_likes テーブルのRLSテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;
  let missionId: string;
  let missionArtifactId: string;
  let achievementId: string;
  let videoId: string;
  let youtubeLikeId: string;

  beforeEach(async () => {
    // テストユーザーを作成
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    user2 = await createTestUser(`${crypto.randomUUID()}@example.com`);

    // テスト用のYouTube動画を作成
    videoId = `test-video-${crypto.randomUUID().slice(0, 8)}`;
    const videoData = {
      video_id: videoId,
      video_url: `https://www.youtube.com/watch?v=${videoId}`,
      title: "テスト動画 for RLS",
      channel_id: "test-channel-id",
      channel_title: "テストチャンネル",
      is_active: true,
    };

    const { error: videoError } = await adminClient
      .from("youtube_videos")
      .insert(videoData);
    if (videoError) {
      throw new Error(`YouTube動画作成エラー: ${videoError.message}`);
    }

    // テスト用ミッションを作成（管理者権限で）
    const missionData = {
      id: crypto.randomUUID(),
      title: "YouTubeミッション for RLS",
      content: "これはRLSテスト用のYouTubeミッションです",
      difficulty: 1,
      required_artifact_type: "YOUTUBE" as const,
      slug: `test-youtube-mission-${crypto.randomUUID()}`,
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
      artifact_type: "YOUTUBE" as const,
      link_url: `https://www.youtube.com/watch?v=${videoId}`,
    };

    const { error: artifactError } = await adminClient
      .from("mission_artifacts")
      .insert(artifactData);
    if (artifactError) {
      throw new Error(`成果物作成エラー: ${artifactError.message}`);
    }
    missionArtifactId = artifactData.id;

    // テスト用のYouTubeいいね記録を作成
    const likeData = {
      id: crypto.randomUUID(),
      user_id: user1.user.userId,
      video_id: videoId,
      mission_artifact_id: missionArtifactId,
    };

    const { error: likeError } = await adminClient
      .from("youtube_video_likes")
      .insert(likeData);
    if (likeError) {
      throw new Error(`YouTubeいいね記録作成エラー: ${likeError.message}`);
    }
    youtubeLikeId = likeData.id;
  });

  afterEach(async () => {
    // テストデータをクリーンアップ
    await adminClient
      .from("youtube_video_likes")
      .delete()
      .eq("id", youtubeLikeId);
    await adminClient
      .from("mission_artifacts")
      .delete()
      .eq("id", missionArtifactId);
    await adminClient.from("achievements").delete().eq("id", achievementId);
    await adminClient.from("missions").delete().eq("id", missionId);
    await adminClient.from("youtube_videos").delete().eq("video_id", videoId);
    await cleanupTestUser(user1.user.userId);
    await cleanupTestUser(user2.user.userId);
  });

  test("匿名ユーザーはYouTubeいいね記録を読み取れない", async () => {
    const anonClient = getAnonClient();
    const { data } = await anonClient.from("youtube_video_likes").select("*");

    expect(data?.length).toBe(0);
  });

  test("認証済みユーザーは自分のYouTubeいいね記録のみ読み取れる", async () => {
    // user1は自分のいいね記録を読み取れる
    const { data: user1Data, error: user1Error } = await user1.client
      .from("youtube_video_likes")
      .select("*")
      .eq("id", youtubeLikeId);

    expect(user1Error).toBeNull();
    expect(user1Data).toHaveLength(1);

    // user2は他人のいいね記録を読み取れない
    const { data: user2Data, error: user2Error } = await user2.client
      .from("youtube_video_likes")
      .select("*")
      .eq("id", youtubeLikeId);

    expect(user2Error).toBeNull();
    expect(user2Data).toHaveLength(0); // 読み取れない
  });

  test("認証済みユーザーは自分の成果物に対してYouTubeいいね記録を作成できる", async () => {
    // 新しい動画を作成
    const newVideoId = `test-video-${crypto.randomUUID().slice(0, 8)}`;
    await adminClient.from("youtube_videos").insert({
      video_id: newVideoId,
      video_url: `https://www.youtube.com/watch?v=${newVideoId}`,
      title: "新しいテスト動画",
      channel_id: "test-channel-id",
      channel_title: "テストチャンネル",
      is_active: true,
    });

    // 新しい達成記録と成果物を作成
    const newAchievementId = crypto.randomUUID();
    await adminClient.from("achievements").insert({
      id: newAchievementId,
      mission_id: missionId,
      user_id: user1.user.userId,
    });

    const newArtifactId = crypto.randomUUID();
    await adminClient.from("mission_artifacts").insert({
      id: newArtifactId,
      achievement_id: newAchievementId,
      user_id: user1.user.userId,
      artifact_type: "YOUTUBE" as const,
      link_url: `https://www.youtube.com/watch?v=${newVideoId}`,
    });

    // user1は自分の成果物に対していいね記録を作成できる
    const newLikeData = {
      id: crypto.randomUUID(),
      user_id: user1.user.userId,
      video_id: newVideoId,
      mission_artifact_id: newArtifactId,
    };

    const { data: insertData, error: insertError } = await user1.client
      .from("youtube_video_likes")
      .insert(newLikeData)
      .select();

    expect(insertError).toBeNull();
    expect(insertData).toHaveLength(1);

    // クリーンアップ
    await adminClient
      .from("youtube_video_likes")
      .delete()
      .eq("id", newLikeData.id);
    await adminClient
      .from("mission_artifacts")
      .delete()
      .eq("id", newArtifactId);
    await adminClient.from("achievements").delete().eq("id", newAchievementId);
    await adminClient
      .from("youtube_videos")
      .delete()
      .eq("video_id", newVideoId);
  });

  test("認証済みユーザーは他人の成果物に対してYouTubeいいね記録を作成できない", async () => {
    // 新しい動画を作成
    const newVideoId = `test-video-${crypto.randomUUID().slice(0, 8)}`;
    await adminClient.from("youtube_videos").insert({
      video_id: newVideoId,
      video_url: `https://www.youtube.com/watch?v=${newVideoId}`,
      title: "他人用テスト動画",
      channel_id: "test-channel-id",
      channel_title: "テストチャンネル",
      is_active: true,
    });

    // user2の達成記録と成果物を作成
    const user2AchievementId = crypto.randomUUID();
    await adminClient.from("achievements").insert({
      id: user2AchievementId,
      mission_id: missionId,
      user_id: user2.user.userId,
    });

    const user2ArtifactId = crypto.randomUUID();
    await adminClient.from("mission_artifacts").insert({
      id: user2ArtifactId,
      achievement_id: user2AchievementId,
      user_id: user2.user.userId,
      artifact_type: "YOUTUBE" as const,
      link_url: `https://www.youtube.com/watch?v=${newVideoId}`,
    });

    // user1がuser2の成果物に対していいね記録を作成しようとする
    const invalidLikeData = {
      id: crypto.randomUUID(),
      user_id: user1.user.userId,
      video_id: newVideoId,
      mission_artifact_id: user2ArtifactId,
    };

    const { data: insertData, error: insertError } = await user1.client
      .from("youtube_video_likes")
      .insert(invalidLikeData)
      .select();

    // RLSによって挿入が拒否される
    expect(insertError).toBeTruthy();
    expect(insertData).toBeNull();

    // クリーンアップ
    await adminClient
      .from("mission_artifacts")
      .delete()
      .eq("id", user2ArtifactId);
    await adminClient
      .from("achievements")
      .delete()
      .eq("id", user2AchievementId);
    await adminClient
      .from("youtube_videos")
      .delete()
      .eq("video_id", newVideoId);
  });

  test("認証済みユーザーは自分のYouTubeいいね記録のみ削除できる", async () => {
    // user2は他人のいいね記録を削除できない
    const { data: user2DeleteData, error: user2DeleteError } =
      await user2.client
        .from("youtube_video_likes")
        .delete()
        .eq("id", youtubeLikeId)
        .select();

    expect(user2DeleteError).toBeNull();
    expect(user2DeleteData).toHaveLength(0); // 削除されたレコードなし

    // user1は自分のいいね記録を削除できる
    const { data: deleteData, error: deleteError } = await user1.client
      .from("youtube_video_likes")
      .delete()
      .eq("id", youtubeLikeId)
      .select();

    expect(deleteError).toBeNull();
    expect(deleteData).toHaveLength(1);
    expect(deleteData?.[0].id).toBe(youtubeLikeId);

    // 再作成（afterEachのクリーンアップで削除エラーを防ぐ）
    await adminClient.from("youtube_video_likes").insert({
      id: youtubeLikeId,
      user_id: user1.user.userId,
      video_id: videoId,
      mission_artifact_id: missionArtifactId,
    });
  });
});

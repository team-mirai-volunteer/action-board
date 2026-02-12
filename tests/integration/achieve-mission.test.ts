import type { SupabaseClient } from "@supabase/supabase-js";
import { achieveMission } from "@/features/mission-detail/use-cases/achieve-mission";
import { cancelSubmission } from "@/features/mission-detail/use-cases/cancel-submission";
import type { Database } from "@/lib/types/supabase";
import {
  adminClient,
  cleanupTestUser,
  createTestUser,
} from "../supabase/utils";
import {
  cleanupTestMission,
  cleanupTestUserLevel,
  cleanupTestXpTransactions,
  createTestMission,
  getTestUserXp,
  initializeTestUserLevel,
  type TestMission,
} from "./mission-test-helpers";

describe("achieveMission ユースケース", () => {
  let testMission: TestMission;
  let testUserId: string;
  let testUserClient: SupabaseClient<Database>;

  beforeEach(async () => {
    const { user, client } = await createTestUser();
    testUserId = user.userId;
    testUserClient = client;
    await initializeTestUserLevel(testUserId);
  });

  afterEach(async () => {
    if (testMission) {
      await cleanupTestMission(testMission.id);
    }
    if (testUserId) {
      await cleanupTestXpTransactions(testUserId);
      await cleanupTestUserLevel(testUserId);
      await cleanupTestUser(testUserId);
    }
  });

  test("NONEタイプでミッション達成できる", async () => {
    testMission = await createTestMission({
      requiredArtifactType: "NONE",
      difficulty: 1,
    });

    const result = await achieveMission(adminClient, testUserClient, {
      userId: testUserId,
      missionId: testMission.id,
      artifactType: "NONE",
      artifactData: {
        missionId: testMission.id,
        requiredArtifactType: "NONE",
      } as any,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.message).toBe("ミッションを達成しました！");
    expect(result.xpGranted).toBeGreaterThan(0);

    // DB確認: achievementが作成されている
    const { data: achievements } = await adminClient
      .from("achievements")
      .select("id, user_id, mission_id")
      .eq("user_id", testUserId)
      .eq("mission_id", testMission.id);

    expect(achievements).toHaveLength(1);
    expect(achievements![0].user_id).toBe(testUserId);

    // DB確認: XPが付与されている
    const xp = await getTestUserXp(testUserId);
    expect(xp).not.toBeNull();
    expect(xp!.xp).toBeGreaterThan(0);
  });

  test("TEXTタイプでミッション達成 - artifact が保存される", async () => {
    testMission = await createTestMission({
      requiredArtifactType: "TEXT",
      difficulty: 2,
    });

    const result = await achieveMission(adminClient, testUserClient, {
      userId: testUserId,
      missionId: testMission.id,
      artifactType: "TEXT",
      artifactData: {
        missionId: testMission.id,
        requiredArtifactType: "TEXT",
        artifactText: "テスト成果物テキスト",
      } as any,
      artifactDescription: "テスト説明",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.artifactId).toBeDefined();

    // DB確認: artifactが作成されている
    const { data: artifacts } = await adminClient
      .from("mission_artifacts")
      .select("id, artifact_type, text_content, description")
      .eq("id", result.artifactId!);

    expect(artifacts).toHaveLength(1);
    expect(artifacts![0].artifact_type).toBe("TEXT");
    expect(artifacts![0].text_content).toBe("テスト成果物テキスト");
    expect(artifacts![0].description).toBe("テスト説明");
  });

  test("LINKタイプでミッション達成 - link_url が保存される", async () => {
    testMission = await createTestMission({
      requiredArtifactType: "LINK",
      difficulty: 1,
      maxAchievementCount: null,
    });

    const result = await achieveMission(adminClient, testUserClient, {
      userId: testUserId,
      missionId: testMission.id,
      artifactType: "LINK",
      artifactData: {
        missionId: testMission.id,
        requiredArtifactType: "LINK",
        artifactLink: "https://example.com/test-link",
      } as any,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.artifactId).toBeDefined();

    // DB確認: artifactにlink_urlが保存されている
    const { data: artifacts } = await adminClient
      .from("mission_artifacts")
      .select("id, artifact_type, link_url")
      .eq("id", result.artifactId!);

    expect(artifacts).toHaveLength(1);
    expect(artifacts![0].artifact_type).toBe("LINK");
    expect(artifacts![0].link_url).toBe("https://example.com/test-link");
  });

  test("同一ミッションの重複リンクはエラーになる", async () => {
    testMission = await createTestMission({
      requiredArtifactType: "LINK",
      difficulty: 1,
      maxAchievementCount: null,
    });

    // 1回目: 成功
    const firstResult = await achieveMission(adminClient, testUserClient, {
      userId: testUserId,
      missionId: testMission.id,
      artifactType: "LINK",
      artifactData: {
        missionId: testMission.id,
        requiredArtifactType: "LINK",
        artifactLink: "https://example.com/duplicate-test",
      } as any,
    });
    expect(firstResult.success).toBe(true);

    // 2回目: 同じURLで重複エラー
    const secondResult = await achieveMission(adminClient, testUserClient, {
      userId: testUserId,
      missionId: testMission.id,
      artifactType: "LINK",
      artifactData: {
        missionId: testMission.id,
        requiredArtifactType: "LINK",
        artifactLink: "https://example.com/duplicate-test",
      } as any,
    });

    expect(secondResult.success).toBe(false);
    if (secondResult.success) return;
    expect(secondResult.error).toContain("同じURL");
  });

  test("max_achievement_count超過でエラーになる", async () => {
    testMission = await createTestMission({
      requiredArtifactType: "NONE",
      difficulty: 1,
      maxAchievementCount: 1,
    });

    // 1回目: 成功
    const firstResult = await achieveMission(adminClient, testUserClient, {
      userId: testUserId,
      missionId: testMission.id,
      artifactType: "NONE",
      artifactData: {
        missionId: testMission.id,
        requiredArtifactType: "NONE",
      } as any,
    });
    expect(firstResult.success).toBe(true);

    // 2回目: 上限超過エラー
    const secondResult = await achieveMission(adminClient, testUserClient, {
      userId: testUserId,
      missionId: testMission.id,
      artifactType: "NONE",
      artifactData: {
        missionId: testMission.id,
        requiredArtifactType: "NONE",
      } as any,
    });

    expect(secondResult.success).toBe(false);
    if (secondResult.success) return;
    expect(secondResult.error).toContain("上限");

    // DB確認: achievementは1つだけ
    const { data: achievements } = await adminClient
      .from("achievements")
      .select("id")
      .eq("user_id", testUserId)
      .eq("mission_id", testMission.id);

    expect(achievements).toHaveLength(1);
  });

  test("ミッション達成取り消し - XPがマイナスされる", async () => {
    testMission = await createTestMission({
      requiredArtifactType: "NONE",
      difficulty: 1,
    });

    // ミッション達成
    const achieveResult = await achieveMission(adminClient, testUserClient, {
      userId: testUserId,
      missionId: testMission.id,
      artifactType: "NONE",
      artifactData: {
        missionId: testMission.id,
        requiredArtifactType: "NONE",
      } as any,
    });
    expect(achieveResult.success).toBe(true);

    // XP確認
    const xpBefore = await getTestUserXp(testUserId);
    expect(xpBefore!.xp).toBeGreaterThan(0);

    // achievementのIDを取得
    const { data: achievements } = await adminClient
      .from("achievements")
      .select("id")
      .eq("user_id", testUserId)
      .eq("mission_id", testMission.id);

    expect(achievements).toHaveLength(1);
    const achievementId = achievements![0].id;

    // 取り消し
    const cancelResult = await cancelSubmission(testUserClient, {
      userId: testUserId,
      achievementId,
      missionId: testMission.id,
    });

    expect(cancelResult.success).toBe(true);
    if (!cancelResult.success) return;
    expect(cancelResult.message).toBe("達成を取り消しました。");
    expect(cancelResult.xpRevoked).toBeGreaterThan(0);

    // DB確認: achievementが削除されている
    const { data: achievementsAfter } = await adminClient
      .from("achievements")
      .select("id")
      .eq("user_id", testUserId)
      .eq("mission_id", testMission.id);

    expect(achievementsAfter).toHaveLength(0);

    // DB確認: XPが減算されている
    const xpAfter = await getTestUserXp(testUserId);
    expect(xpAfter!.xp).toBe(0);
  });
});

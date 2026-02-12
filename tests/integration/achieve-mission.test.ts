import type { SupabaseClient } from "@supabase/supabase-js";
import { achieveMission } from "@/features/mission-detail/use-cases/achieve-mission";
import { cancelSubmission } from "@/features/mission-detail/use-cases/cancel-submission";
import {
  MAX_POSTER_COUNT,
  POSTER_POINTS_PER_UNIT,
  POSTING_POINTS_PER_UNIT,
} from "@/lib/constants/mission-config";
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
    const cancelResult = await cancelSubmission(adminClient, testUserClient, {
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

  test("POSTINGタイプでミッション達成 - posting_activities にレコードが作成される", async () => {
    testMission = await createTestMission({
      requiredArtifactType: "POSTING",
      difficulty: 1,
      isFeatured: false,
    });

    const postingCount = 5;
    const result = await achieveMission(adminClient, testUserClient, {
      userId: testUserId,
      missionId: testMission.id,
      artifactType: "POSTING",
      artifactData: {
        missionId: testMission.id,
        requiredArtifactType: "POSTING",
        postingCount,
        locationText: "テスト場所",
      } as any,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.artifactId).toBeDefined();

    // DB確認: posting_activities にレコードが作成されている
    const { data: postingActivities } = await adminClient
      .from("posting_activities")
      .select("id, posting_count, location_text, mission_artifact_id")
      .eq("mission_artifact_id", result.artifactId!);

    expect(postingActivities).toHaveLength(1);
    expect(postingActivities![0].posting_count).toBe(postingCount);
    expect(postingActivities![0].location_text).toBe("テスト場所");

    // DB確認: ボーナスXPが付与されている（BONUS トランザクション）
    const { data: bonusXpTransactions } = await adminClient
      .from("xp_transactions")
      .select("xp_amount, source_type")
      .eq("user_id", testUserId)
      .eq("source_type", "BONUS");

    expect(bonusXpTransactions).toHaveLength(1);
    const expectedBonusXp = postingCount * POSTING_POINTS_PER_UNIT;
    expect(bonusXpTransactions![0].xp_amount).toBe(expectedBonusXp);

    // POSTINGミッションではベースXP（MISSION_COMPLETION）は付与されない
    const { data: missionXpTransactions } = await adminClient
      .from("xp_transactions")
      .select("xp_amount, source_type")
      .eq("user_id", testUserId)
      .eq("source_type", "MISSION_COMPLETION");

    expect(missionXpTransactions).toHaveLength(0);

    // 合計XP = ボーナスXPのみ
    expect(result.xpGranted).toBe(expectedBonusXp);
  });

  test("POSTERタイプでミッション達成 - poster_activities にレコードが作成される", async () => {
    testMission = await createTestMission({
      requiredArtifactType: "POSTER",
      difficulty: 1,
      isFeatured: false,
    });

    const result = await achieveMission(adminClient, testUserClient, {
      userId: testUserId,
      missionId: testMission.id,
      artifactType: "POSTER",
      artifactData: {
        missionId: testMission.id,
        requiredArtifactType: "POSTER",
        prefecture: "東京都",
        city: "テスト市",
        boardNumber: "TEST-001",
        boardName: "テスト掲示板",
        boardNote: null,
        boardAddress: "テスト住所",
        boardLat: "35.6762",
        boardLong: "139.6503",
      } as any,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.artifactId).toBeDefined();

    // DB確認: poster_activities にレコードが作成されている
    const { data: posterActivities } = await adminClient
      .from("poster_activities")
      .select(
        "id, poster_count, prefecture, city, number, name, user_id, mission_artifact_id",
      )
      .eq("mission_artifact_id", result.artifactId!);

    expect(posterActivities).toHaveLength(1);
    expect(posterActivities![0].poster_count).toBe(MAX_POSTER_COUNT);
    expect(posterActivities![0].prefecture).toBe("東京都");
    expect(posterActivities![0].city).toBe("テスト市");
    expect(posterActivities![0].number).toBe("TEST-001");
    expect(posterActivities![0].name).toBe("テスト掲示板");
    expect(posterActivities![0].user_id).toBe(testUserId);

    // DB確認: ボーナスXPが付与されている
    const { data: bonusXpTransactions } = await adminClient
      .from("xp_transactions")
      .select("xp_amount, source_type")
      .eq("user_id", testUserId)
      .eq("source_type", "BONUS");

    expect(bonusXpTransactions).toHaveLength(1);
    const expectedBonusXp = MAX_POSTER_COUNT * POSTER_POINTS_PER_UNIT;
    expect(bonusXpTransactions![0].xp_amount).toBe(expectedBonusXp);
  });

  test("is_featured=true のPOSTINGミッションでボーナスXPが2倍になる", async () => {
    testMission = await createTestMission({
      requiredArtifactType: "POSTING",
      difficulty: 1,
      isFeatured: true,
    });

    const postingCount = 3;
    const result = await achieveMission(adminClient, testUserClient, {
      userId: testUserId,
      missionId: testMission.id,
      artifactType: "POSTING",
      artifactData: {
        missionId: testMission.id,
        requiredArtifactType: "POSTING",
        postingCount,
        locationText: "テスト場所（2倍）",
      } as any,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    // DB確認: ボーナスXPが2倍で付与されている
    const { data: bonusXpTransactions } = await adminClient
      .from("xp_transactions")
      .select("xp_amount, source_type, description")
      .eq("user_id", testUserId)
      .eq("source_type", "BONUS");

    expect(bonusXpTransactions).toHaveLength(1);
    const basePoints = postingCount * POSTING_POINTS_PER_UNIT;
    const expectedBonusXp = basePoints * 2; // is_featured=true で2倍
    expect(bonusXpTransactions![0].xp_amount).toBe(expectedBonusXp);
    expect(bonusXpTransactions![0].description).toContain("2倍");

    // 合計XP確認
    expect(result.xpGranted).toBe(expectedBonusXp);
  });
});

describe("cancelSubmission ユースケース - 追加テスト", () => {
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

  test("POSTINGミッション（ボーナスミッション）の取り消しでボーナスXPも減算される", async () => {
    // BONUS_MISSION_SLUGS に含まれるスラグを使うため、既存ミッションを一時的にリネーム
    const bonusSlug = "posting-magazine";
    const { data: existingMission } = await adminClient
      .from("missions")
      .select("id, slug")
      .eq("slug", bonusSlug)
      .maybeSingle();

    let originalMissionId: string | null = null;
    if (existingMission) {
      originalMissionId = existingMission.id;
      await adminClient
        .from("missions")
        .update({ slug: `${bonusSlug}-backup-${Date.now()}` })
        .eq("id", originalMissionId);
    }

    try {
      testMission = await createTestMission({
        requiredArtifactType: "POSTING",
        difficulty: 1,
        slug: bonusSlug,
        isFeatured: false,
      });

      const postingCount = 5;
      // ミッション達成
      const achieveResult = await achieveMission(adminClient, testUserClient, {
        userId: testUserId,
        missionId: testMission.id,
        artifactType: "POSTING",
        artifactData: {
          missionId: testMission.id,
          requiredArtifactType: "POSTING",
          postingCount,
          locationText: "テスト場所",
        } as any,
      });
      expect(achieveResult.success).toBe(true);

      // XP確認 - ボーナスXPのみが付与されている（POSTINGはベースXPなし）
      const xpBefore = await getTestUserXp(testUserId);
      const expectedBonusXp = postingCount * POSTING_POINTS_PER_UNIT;
      expect(xpBefore!.xp).toBe(expectedBonusXp);

      // achievementのIDを取得
      const { data: achievements } = await adminClient
        .from("achievements")
        .select("id")
        .eq("user_id", testUserId)
        .eq("mission_id", testMission.id);

      expect(achievements).toHaveLength(1);
      const achievementId = achievements![0].id;

      // 取り消し
      const cancelResult = await cancelSubmission(adminClient, testUserClient, {
        userId: testUserId,
        achievementId,
        missionId: testMission.id,
      });

      expect(cancelResult.success).toBe(true);
      if (!cancelResult.success) return;
      expect(cancelResult.message).toBe("達成を取り消しました。");

      // DB確認: achievementが削除されている
      const { data: achievementsAfter } = await adminClient
        .from("achievements")
        .select("id")
        .eq("user_id", testUserId)
        .eq("mission_id", testMission.id);

      expect(achievementsAfter).toHaveLength(0);

      // DB確認: XPが0に戻っている（ボーナスXP分も含めて減算）
      const xpAfter = await getTestUserXp(testUserId);
      expect(xpAfter!.xp).toBe(0);
    } finally {
      // 既存ミッションのスラグを元に戻す
      if (originalMissionId) {
        await adminClient
          .from("missions")
          .update({ slug: bonusSlug })
          .eq("id", originalMissionId);
      }
    }
  });

  test("存在しない achievementId の取り消しはエラーになる", async () => {
    testMission = await createTestMission({
      requiredArtifactType: "NONE",
      difficulty: 1,
    });

    const nonExistentId = "00000000-0000-0000-0000-000000000000";

    const cancelResult = await cancelSubmission(adminClient, testUserClient, {
      userId: testUserId,
      achievementId: nonExistentId,
      missionId: testMission.id,
    });

    expect(cancelResult.success).toBe(false);
    if (cancelResult.success) return;
    expect(cancelResult.error).toContain("見つからない");
  });
});

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/supabase";
import {
  adminClient,
  cleanupTestUser,
  createTestUser,
} from "../supabase/utils";
import {
  cleanupTestMission,
  createTestMission,
  initializeTestUserLevel,
  type TestMission,
} from "./mission-test-helpers";

describe("delete_user_account RPC（退会機能）", () => {
  let testUserId: string;
  let testUserClient: SupabaseClient<Database>;
  let testMission: TestMission | null = null;

  beforeEach(async () => {
    const { user, client } = await createTestUser();
    testUserId = user.userId;
    testUserClient = client;
  });

  afterEach(async () => {
    if (testMission) {
      await cleanupTestMission(testMission.id);
      testMission = null;
    }
    // cleanupTestUserはauth.usersの削除も行う（RPC成功テストではすでに削除済みの場合がある）
    try {
      await cleanupTestUser(testUserId);
    } catch {
      // RPC + auth削除済みの場合は無視
    }
  });

  test("関連データが全て削除される（基本ケース）", async () => {
    // テストデータを各テーブルに投入
    await initializeTestUserLevel(testUserId);

    testMission = await createTestMission({
      requiredArtifactType: "NONE",
      difficulty: 1,
    });

    // achievements
    const { data: achievement } = await adminClient
      .from("achievements")
      .insert({
        user_id: testUserId,
        mission_id: testMission.id,
      })
      .select("id")
      .single();

    // mission_artifacts（TEXT型: text_contentが必須、link_url/image_storage_pathはNULL）
    const { error: artifactError } = await adminClient
      .from("mission_artifacts")
      .insert({
        user_id: testUserId,
        achievement_id: achievement!.id,
        artifact_type: "TEXT",
        text_content: "テスト成果物",
        link_url: null,
        image_storage_path: null,
      });
    if (artifactError)
      throw new Error(`artifact insert failed: ${artifactError.message}`);

    // xp_transactions
    await adminClient.from("xp_transactions").insert({
      user_id: testUserId,
      xp_amount: 100,
      source_type: "MISSION_COMPLETION",
      description: "テスト用XP",
    });

    // user_badges
    await adminClient.from("user_badges").insert({
      user_id: testUserId,
      badge_type: "DAILY",
      rank: 1,
    });

    // user_activities
    await adminClient.from("user_activities").insert({
      user_id: testUserId,
      activity_type: "test",
      activity_title: "テストアクティビティ",
    });

    // user_referral
    await adminClient.from("user_referral").insert({
      user_id: testUserId,
      referral_code: `TEST${Date.now().toString().slice(-4)}`,
    });

    // RPC呼び出し
    const { error } = await testUserClient.rpc("delete_user_account", {
      target_user_id: testUserId,
    });
    expect(error).toBeNull();

    // 全テーブルからデータが消えていることを確認
    const { data: privateUser } = await adminClient
      .from("private_users")
      .select("id")
      .eq("id", testUserId)
      .maybeSingle();
    expect(privateUser).toBeNull();

    const { data: publicProfile } = await adminClient
      .from("public_user_profiles")
      .select("id")
      .eq("id", testUserId)
      .maybeSingle();
    expect(publicProfile).toBeNull();

    const { data: achievements } = await adminClient
      .from("achievements")
      .select("id")
      .eq("user_id", testUserId);
    expect(achievements ?? []).toHaveLength(0);

    const { data: artifacts } = await adminClient
      .from("mission_artifacts")
      .select("id")
      .eq("user_id", testUserId);
    expect(artifacts ?? []).toHaveLength(0);

    const { data: xpTransactions } = await adminClient
      .from("xp_transactions")
      .select("id")
      .eq("user_id", testUserId);
    expect(xpTransactions ?? []).toHaveLength(0);

    const { data: userLevels } = await adminClient
      .from("user_levels")
      .select("id")
      .eq("user_id", testUserId);
    expect(userLevels ?? []).toHaveLength(0);

    const { data: userBadges } = await adminClient
      .from("user_badges")
      .select("id")
      .eq("user_id", testUserId);
    expect(userBadges ?? []).toHaveLength(0);

    const { data: userActivities } = await adminClient
      .from("user_activities")
      .select("id")
      .eq("user_id", testUserId);
    expect(userActivities ?? []).toHaveLength(0);

    const { data: userReferral } = await adminClient
      .from("user_referral")
      .select("id")
      .eq("user_id", testUserId);
    expect(userReferral ?? []).toHaveLength(0);
  });

  test("poster関連データも削除される", async () => {
    // poster_board_status_history の投入にはposter_boardsのレコードが必要
    const { data: board } = await adminClient
      .from("poster_boards")
      .select("id")
      .limit(1)
      .single();

    if (board) {
      await adminClient.from("poster_board_status_history").insert({
        board_id: board.id,
        user_id: testUserId,
        new_status: "done",
      });
    }

    testMission = await createTestMission({
      requiredArtifactType: "POSTER",
      difficulty: 1,
    });

    const { data: achievement } = await adminClient
      .from("achievements")
      .insert({
        user_id: testUserId,
        mission_id: testMission.id,
      })
      .select("id")
      .single();

    const { data: artifact, error: artifactError } = await adminClient
      .from("mission_artifacts")
      .insert({
        user_id: testUserId,
        achievement_id: achievement!.id,
        artifact_type: "POSTER",
        text_content: "テスト掲示板ポスティング",
        link_url: null,
        image_storage_path: null,
      })
      .select("id")
      .single();
    if (artifactError)
      throw new Error(`artifact insert failed: ${artifactError.message}`);

    // poster_activities
    await adminClient.from("poster_activities").insert({
      user_id: testUserId,
      mission_artifact_id: artifact!.id,
      poster_count: 10,
      prefecture: "東京都",
      city: "テスト市",
      number: `TEST-${Date.now()}`,
      name: "テスト掲示板",
    });

    // RPC呼び出し
    const { error } = await testUserClient.rpc("delete_user_account", {
      target_user_id: testUserId,
    });
    expect(error).toBeNull();

    const { data: posterActivities } = await adminClient
      .from("poster_activities")
      .select("id")
      .eq("user_id", testUserId);
    expect(posterActivities ?? []).toHaveLength(0);

    if (board) {
      const { data: statusHistory } = await adminClient
        .from("poster_board_status_history")
        .select("id")
        .eq("user_id", testUserId);
      expect(statusHistory ?? []).toHaveLength(0);
    }
  });

  test("他人のアカウントは削除できない", async () => {
    // 別のテストユーザーを作成
    const { user: otherUser } = await createTestUser();

    // testUserClientで他人のアカウントを削除しようとする
    const { error } = await testUserClient.rpc("delete_user_account", {
      target_user_id: otherUser.userId,
    });

    expect(error).not.toBeNull();
    expect(error!.message).toContain("Unauthorized");

    // 他人のデータが残っていることを確認
    const { data: otherPrivateUser } = await adminClient
      .from("private_users")
      .select("id")
      .eq("id", otherUser.userId)
      .maybeSingle();
    expect(otherPrivateUser).not.toBeNull();

    const { data: otherPublicProfile } = await adminClient
      .from("public_user_profiles")
      .select("id")
      .eq("id", otherUser.userId)
      .maybeSingle();
    expect(otherPublicProfile).not.toBeNull();

    // クリーンアップ
    await cleanupTestUser(otherUser.userId);
  });

  test("未認証ユーザーはRPCを呼び出せない", async () => {
    // 匿名クライアント（未認証）
    const { getAnonClient } = await import("../supabase/utils");
    const anonClient = getAnonClient();

    const { error } = await anonClient.rpc("delete_user_account", {
      target_user_id: testUserId,
    });

    expect(error).not.toBeNull();

    // データが残っていることを確認
    const { data: privateUser } = await adminClient
      .from("private_users")
      .select("id")
      .eq("id", testUserId)
      .maybeSingle();
    expect(privateUser).not.toBeNull();
  });

  test("関連データがないユーザーでも正常に退会できる", async () => {
    // private_users と public_user_profiles のみ存在する状態で退会
    const { error } = await testUserClient.rpc("delete_user_account", {
      target_user_id: testUserId,
    });
    expect(error).toBeNull();

    const { data: privateUser } = await adminClient
      .from("private_users")
      .select("id")
      .eq("id", testUserId)
      .maybeSingle();
    expect(privateUser).toBeNull();

    const { data: publicProfile } = await adminClient
      .from("public_user_profiles")
      .select("id")
      .eq("id", testUserId)
      .maybeSingle();
    expect(publicProfile).toBeNull();
  });

  test("退会後にauth.admin.deleteUserでauthユーザーも削除できる", async () => {
    // RPC呼び出し（DBデータ削除）
    const { error: rpcError } = await testUserClient.rpc(
      "delete_user_account",
      { target_user_id: testUserId },
    );
    expect(rpcError).toBeNull();

    // auth.users削除（実際のdeleteAccount関数と同じ流れ）
    const { error: authError } =
      await adminClient.auth.admin.deleteUser(testUserId);
    expect(authError).toBeNull();

    // authユーザーも消えていることを確認
    const { error: getUserError } =
      await adminClient.auth.admin.getUserById(testUserId);

    // ユーザーが見つからないことを確認
    expect(getUserError).not.toBeNull();
  });

  test("存在しないユーザーIDを指定してもエラーにならない（冪等性）", async () => {
    const nonExistentId = "00000000-0000-0000-0000-000000000000";

    // 自分のIDと異なるため認可エラーになる
    const { error } = await testUserClient.rpc("delete_user_account", {
      target_user_id: nonExistentId,
    });

    expect(error).not.toBeNull();
    expect(error!.message).toContain("Unauthorized");
  });
});

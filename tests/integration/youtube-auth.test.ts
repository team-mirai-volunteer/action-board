import { linkYouTubeAccount } from "@/features/youtube/use-cases/link-youtube-account";
import { refreshYouTubeToken } from "@/features/youtube/use-cases/refresh-youtube-token";
import { unlinkYouTubeAccount } from "@/features/youtube/use-cases/unlink-youtube-account";
import { FakeYouTubeAuthClient } from "./fake-youtube-auth-client";
import { adminClient, cleanupTestUser, createTestUser } from "./utils";

describe("YouTube OAuth ユースケース", () => {
  const createdUserIds: string[] = [];

  afterEach(async () => {
    // youtube_user_connectionsを先にクリーンアップ（FK制約）
    for (const id of createdUserIds) {
      await adminClient
        .from("youtube_user_connections")
        .delete()
        .eq("user_id", id);
      await cleanupTestUser(id);
    }
    createdUserIds.length = 0;
  });

  describe("linkYouTubeAccount", () => {
    test("YouTubeアカウントが連携される", async () => {
      const { user } = await createTestUser();
      createdUserIds.push(user.userId);

      const googleUserId = `google_${Date.now()}`;
      const channelId = `UC_test_${Date.now()}`;
      const fakeClient = new FakeYouTubeAuthClient(
        googleUserId,
        channelId,
        "テストチャンネル",
      );

      const result = await linkYouTubeAccount(adminClient, fakeClient, {
        userId: user.userId,
        code: "fake-code",
        redirectUri: "http://localhost:3000/auth/youtube-callback",
      });

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.channel.id).toBe(channelId);
      expect(result.channel.title).toBe("テストチャンネル");

      // DBに正しく保存されているか検証
      const { data: connection } = await adminClient
        .from("youtube_user_connections")
        .select("*")
        .eq("user_id", user.userId)
        .single();

      expect(connection).not.toBeNull();
      expect(connection!.google_user_id).toBe(googleUserId);
      expect(connection!.channel_id).toBe(channelId);
      expect(connection!.display_name).toBe("テストチャンネル");
      expect(connection!.access_token).toContain("fake-access-token");
      expect(connection!.refresh_token).toContain("fake-refresh-token");
      expect(connection!.token_expires_at).toBeDefined();
    });

    test("再連携でupsertされる", async () => {
      const { user } = await createTestUser();
      createdUserIds.push(user.userId);

      const googleUserId = `google_${Date.now()}`;
      const channelId = `UC_test_${Date.now()}`;

      // 1回目: 連携
      const fakeClient1 = new FakeYouTubeAuthClient(
        googleUserId,
        channelId,
        "チャンネル名1",
      );
      const first = await linkYouTubeAccount(adminClient, fakeClient1, {
        userId: user.userId,
        code: "fake-code-1",
        redirectUri: "http://localhost:3000/auth/youtube-callback",
      });
      expect(first.success).toBe(true);

      // 2回目: 同じユーザーで再連携（チャンネル名が変わった想定）
      const fakeClient2 = new FakeYouTubeAuthClient(
        googleUserId,
        channelId,
        "チャンネル名2",
      );
      const second = await linkYouTubeAccount(adminClient, fakeClient2, {
        userId: user.userId,
        code: "fake-code-2",
        redirectUri: "http://localhost:3000/auth/youtube-callback",
      });
      expect(second.success).toBe(true);

      // DBにはレコードが1つだけ存在し、display_nameが更新されている
      const { data: connections } = await adminClient
        .from("youtube_user_connections")
        .select("*")
        .eq("user_id", user.userId);

      expect(connections).toHaveLength(1);
      expect(connections![0].display_name).toBe("チャンネル名2");
    });

    test("別ユーザーの同一Googleアカウントでエラー", async () => {
      const { user: user1 } = await createTestUser();
      createdUserIds.push(user1.userId);
      const { user: user2 } = await createTestUser();
      createdUserIds.push(user2.userId);

      const googleUserId = `google_conflict_${Date.now()}`;
      const channelId1 = `UC_test1_${Date.now()}`;
      const channelId2 = `UC_test2_${Date.now()}`;

      // user1が連携
      const fakeClient1 = new FakeYouTubeAuthClient(
        googleUserId,
        channelId1,
        "チャンネル1",
      );
      const first = await linkYouTubeAccount(adminClient, fakeClient1, {
        userId: user1.userId,
        code: "fake-code-1",
        redirectUri: "http://localhost:3000/auth/youtube-callback",
      });
      expect(first.success).toBe(true);

      // user2が同じGoogleアカウントで連携しようとする
      const fakeClient2 = new FakeYouTubeAuthClient(
        googleUserId,
        channelId2,
        "チャンネル2",
      );
      const second = await linkYouTubeAccount(adminClient, fakeClient2, {
        userId: user2.userId,
        code: "fake-code-2",
        redirectUri: "http://localhost:3000/auth/youtube-callback",
      });

      expect(second.success).toBe(false);
      if (second.success) return;
      expect(second.error).toContain("既に別のユーザーに連携");

      // user2のyoutube_user_connectionsが作成されていないことを検証
      const { data: connection } = await adminClient
        .from("youtube_user_connections")
        .select("*")
        .eq("user_id", user2.userId)
        .maybeSingle();

      expect(connection).toBeNull();
    });

    test("別ユーザーの同一チャンネルIDでエラー", async () => {
      const { user: user1 } = await createTestUser();
      createdUserIds.push(user1.userId);
      const { user: user2 } = await createTestUser();
      createdUserIds.push(user2.userId);

      const channelId = `UC_shared_${Date.now()}`;
      const googleUserId1 = `google_1_${Date.now()}`;
      const googleUserId2 = `google_2_${Date.now()}`;

      // user1が連携
      const fakeClient1 = new FakeYouTubeAuthClient(
        googleUserId1,
        channelId,
        "同じチャンネル",
      );
      const first = await linkYouTubeAccount(adminClient, fakeClient1, {
        userId: user1.userId,
        code: "fake-code-1",
        redirectUri: "http://localhost:3000/auth/youtube-callback",
      });
      expect(first.success).toBe(true);

      // user2が同じチャンネルIDで連携しようとする
      const fakeClient2 = new FakeYouTubeAuthClient(
        googleUserId2,
        channelId,
        "同じチャンネル",
      );
      const second = await linkYouTubeAccount(adminClient, fakeClient2, {
        userId: user2.userId,
        code: "fake-code-2",
        redirectUri: "http://localhost:3000/auth/youtube-callback",
      });

      expect(second.success).toBe(false);
      if (second.success) return;
      expect(second.error).toContain("既に別のユーザーに連携");
    });
  });

  describe("unlinkYouTubeAccount", () => {
    test("連携解除でレコードが削除される", async () => {
      const { user } = await createTestUser();
      createdUserIds.push(user.userId);

      // まず連携する
      const googleUserId = `google_unlink_${Date.now()}`;
      const channelId = `UC_unlink_${Date.now()}`;
      const fakeClient = new FakeYouTubeAuthClient(googleUserId, channelId);
      const linkResult = await linkYouTubeAccount(adminClient, fakeClient, {
        userId: user.userId,
        code: "fake-code",
        redirectUri: "http://localhost:3000/auth/youtube-callback",
      });
      expect(linkResult.success).toBe(true);

      // 連携解除
      const result = await unlinkYouTubeAccount(adminClient, user.userId);
      expect(result.success).toBe(true);

      // DBからレコードが削除されていることを検証
      const { data: connection } = await adminClient
        .from("youtube_user_connections")
        .select("*")
        .eq("user_id", user.userId)
        .maybeSingle();

      expect(connection).toBeNull();
    });
  });

  describe("refreshYouTubeToken", () => {
    test("トークンが更新される", async () => {
      const { user } = await createTestUser();
      createdUserIds.push(user.userId);

      // まず連携する
      const googleUserId = `google_refresh_${Date.now()}`;
      const channelId = `UC_refresh_${Date.now()}`;
      const fakeClient = new FakeYouTubeAuthClient(googleUserId, channelId);
      const linkResult = await linkYouTubeAccount(adminClient, fakeClient, {
        userId: user.userId,
        code: "fake-code",
        redirectUri: "http://localhost:3000/auth/youtube-callback",
      });
      expect(linkResult.success).toBe(true);

      // 連携直後のトークンを記録
      const { data: beforeRefresh } = await adminClient
        .from("youtube_user_connections")
        .select("access_token, token_expires_at")
        .eq("user_id", user.userId)
        .single();

      expect(beforeRefresh).not.toBeNull();

      // 少し待ってからリフレッシュ（token_expires_atの更新確認のため）
      await new Promise((resolve) => setTimeout(resolve, 100));

      // トークンリフレッシュ
      const result = await refreshYouTubeToken(
        adminClient,
        fakeClient,
        user.userId,
      );

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.accessToken).toContain("fake-refreshed-access-token");

      // DBのトークンが更新されていることを検証
      const { data: afterRefresh } = await adminClient
        .from("youtube_user_connections")
        .select("access_token, token_expires_at")
        .eq("user_id", user.userId)
        .single();

      expect(afterRefresh).not.toBeNull();
      expect(afterRefresh!.access_token).toContain(
        "fake-refreshed-access-token",
      );
      expect(afterRefresh!.access_token).not.toBe(beforeRefresh!.access_token);
    });

    test("未連携ユーザーのリフレッシュはエラー", async () => {
      const { user } = await createTestUser();
      createdUserIds.push(user.userId);

      const fakeClient = new FakeYouTubeAuthClient("google_dummy", "UC_dummy");

      const result = await refreshYouTubeToken(
        adminClient,
        fakeClient,
        user.userId,
      );

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toContain("連携されていません");
    });
  });
});

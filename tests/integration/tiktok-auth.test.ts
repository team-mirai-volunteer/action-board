import { linkTikTokAccount } from "@/features/tiktok/use-cases/link-tiktok-account";
import { refreshTikTokToken } from "@/features/tiktok/use-cases/refresh-tiktok-token";
import { unlinkTikTokAccount } from "@/features/tiktok/use-cases/unlink-tiktok-account";
import { FakeTikTokAuthClient } from "./fake-tiktok-auth-client";
import { adminClient, cleanupTestUser, createTestUser } from "./utils";

describe("TikTok認証ユースケース", () => {
  const createdUserIds: string[] = [];

  afterEach(async () => {
    for (const id of createdUserIds) {
      // tiktok_user_connectionsを先に削除（FKで自動削除されない場合の安全策）
      await adminClient
        .from("tiktok_user_connections")
        .delete()
        .eq("user_id", id);
      await cleanupTestUser(id);
    }
    createdUserIds.length = 0;
  });

  describe("linkTikTokAccount", () => {
    test("TikTokアカウントが連携される", async () => {
      const { user } = await createTestUser();
      createdUserIds.push(user.userId);

      const tiktokOpenId = `tiktok_test_${Date.now()}`;
      const fakeClient = new FakeTikTokAuthClient(
        tiktokOpenId,
        "テストTikToker",
      );

      const result = await linkTikTokAccount(adminClient, fakeClient, {
        userId: user.userId,
        code: "fake-code",
        codeVerifier: "fake-verifier",
        redirectUri: "http://localhost:3000/auth/tiktok-callback",
      });

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.user.open_id).toBe(tiktokOpenId);
      expect(result.user.display_name).toBe("テストTikToker");

      // DBに正しく保存されているか検証
      const { data: connection } = await adminClient
        .from("tiktok_user_connections")
        .select("*")
        .eq("user_id", user.userId)
        .single();

      expect(connection).not.toBeNull();
      expect(connection!.tiktok_open_id).toBe(tiktokOpenId);
      expect(connection!.display_name).toBe("テストTikToker");
      expect(connection!.access_token).toBe(
        `fake-access-token-${tiktokOpenId}`,
      );
      expect(connection!.refresh_token).toBe(
        `fake-refresh-token-${tiktokOpenId}`,
      );
      expect(connection!.token_expires_at).toBeDefined();
    });

    test("再連携でupsertされる", async () => {
      const { user } = await createTestUser();
      createdUserIds.push(user.userId);

      const tiktokOpenId = `tiktok_upsert_${Date.now()}`;
      const fakeClient1 = new FakeTikTokAuthClient(tiktokOpenId, "最初の名前");

      // 1回目の連携
      const first = await linkTikTokAccount(adminClient, fakeClient1, {
        userId: user.userId,
        code: "fake-code-1",
        codeVerifier: "fake-verifier-1",
        redirectUri: "http://localhost:3000/auth/tiktok-callback",
      });
      expect(first.success).toBe(true);

      // 2回目の連携（同じopen_id、異なる表示名）
      const fakeClient2 = new FakeTikTokAuthClient(
        tiktokOpenId,
        "更新後の名前",
      );
      const second = await linkTikTokAccount(adminClient, fakeClient2, {
        userId: user.userId,
        code: "fake-code-2",
        codeVerifier: "fake-verifier-2",
        redirectUri: "http://localhost:3000/auth/tiktok-callback",
      });
      expect(second.success).toBe(true);

      // DBにレコードが1つだけで、display_nameが更新されていることを確認
      const { data: connections } = await adminClient
        .from("tiktok_user_connections")
        .select("*")
        .eq("user_id", user.userId);

      expect(connections).toHaveLength(1);
      expect(connections![0].display_name).toBe("更新後の名前");
    });

    test("他のユーザーに連携済みのTikTokアカウントはエラー", async () => {
      const { user: user1 } = await createTestUser();
      createdUserIds.push(user1.userId);
      const { user: user2 } = await createTestUser();
      createdUserIds.push(user2.userId);

      const tiktokOpenId = `tiktok_conflict_${Date.now()}`;
      const fakeClient = new FakeTikTokAuthClient(tiktokOpenId);

      // user1で連携
      const first = await linkTikTokAccount(adminClient, fakeClient, {
        userId: user1.userId,
        code: "fake-code",
        codeVerifier: "fake-verifier",
        redirectUri: "http://localhost:3000/auth/tiktok-callback",
      });
      expect(first.success).toBe(true);

      // user2で同じTikTokアカウントを連携しようとする
      const second = await linkTikTokAccount(adminClient, fakeClient, {
        userId: user2.userId,
        code: "fake-code-2",
        codeVerifier: "fake-verifier-2",
        redirectUri: "http://localhost:3000/auth/tiktok-callback",
      });

      expect(second.success).toBe(false);
      if (second.success) return;
      expect(second.error).toContain("既に別のユーザーに連携されています");

      // user2にはconnectionが作成されていないことを確認
      const { data: connection } = await adminClient
        .from("tiktok_user_connections")
        .select("*")
        .eq("user_id", user2.userId)
        .maybeSingle();

      expect(connection).toBeNull();
    });
  });

  describe("unlinkTikTokAccount", () => {
    test("連携していないユーザーのunlinkも成功する", async () => {
      const { user } = await createTestUser();
      createdUserIds.push(user.userId);

      // 連携していない状態でunlinkを呼ぶ（deleteは0件でもエラーにならない）
      const result = await unlinkTikTokAccount(adminClient, user.userId);
      expect(result.success).toBe(true);

      // DBにレコードがないことを確認
      const { data: connection } = await adminClient
        .from("tiktok_user_connections")
        .select("*")
        .eq("user_id", user.userId)
        .maybeSingle();

      expect(connection).toBeNull();
    });

    test("連携解除でレコードが削除される", async () => {
      const { user } = await createTestUser();
      createdUserIds.push(user.userId);

      const tiktokOpenId = `tiktok_unlink_${Date.now()}`;
      const fakeClient = new FakeTikTokAuthClient(tiktokOpenId);

      // まず連携
      await linkTikTokAccount(adminClient, fakeClient, {
        userId: user.userId,
        code: "fake-code",
        codeVerifier: "fake-verifier",
        redirectUri: "http://localhost:3000/auth/tiktok-callback",
      });

      // 連携解除
      const result = await unlinkTikTokAccount(adminClient, user.userId);
      expect(result.success).toBe(true);

      // DBからレコードが削除されていることを確認
      const { data: connection } = await adminClient
        .from("tiktok_user_connections")
        .select("*")
        .eq("user_id", user.userId)
        .maybeSingle();

      expect(connection).toBeNull();
    });
  });

  describe("refreshTikTokToken", () => {
    test("トークンがリフレッシュされる", async () => {
      const { user } = await createTestUser();
      createdUserIds.push(user.userId);

      const tiktokOpenId = `tiktok_refresh_${Date.now()}`;
      const fakeClient = new FakeTikTokAuthClient(tiktokOpenId);

      // まず連携
      await linkTikTokAccount(adminClient, fakeClient, {
        userId: user.userId,
        code: "fake-code",
        codeVerifier: "fake-verifier",
        redirectUri: "http://localhost:3000/auth/tiktok-callback",
      });

      // 連携後のトークンを記録
      const { data: beforeRefresh } = await adminClient
        .from("tiktok_user_connections")
        .select("access_token, refresh_token")
        .eq("user_id", user.userId)
        .single();

      expect(beforeRefresh!.access_token).toBe(
        `fake-access-token-${tiktokOpenId}`,
      );

      // トークンリフレッシュ
      const result = await refreshTikTokToken(
        adminClient,
        fakeClient,
        user.userId,
      );
      expect(result.success).toBe(true);

      // DBのトークンが更新されていることを確認
      const { data: afterRefresh } = await adminClient
        .from("tiktok_user_connections")
        .select("access_token, refresh_token")
        .eq("user_id", user.userId)
        .single();

      expect(afterRefresh!.access_token).toBe(
        `fake-refreshed-access-token-${tiktokOpenId}`,
      );
      expect(afterRefresh!.refresh_token).toBe(
        `fake-refreshed-refresh-token-${tiktokOpenId}`,
      );
    });

    test("未連携ユーザーのリフレッシュはエラー", async () => {
      const { user } = await createTestUser();
      createdUserIds.push(user.userId);

      const fakeClient = new FakeTikTokAuthClient("unused");

      const result = await refreshTikTokToken(
        adminClient,
        fakeClient,
        user.userId,
      );
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toContain("TikTokが連携されていません");
    });
  });
});

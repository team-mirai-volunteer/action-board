import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/supabase";

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(),
}));
jest.mock("@/lib/supabase/adminClient", () => ({
  createAdminClient: jest.fn(),
}));
jest.mock("@/features/user-profile/services/profile", () =>
  jest.requireActual("@/features/user-profile/services/profile"),
);

// メモ化による副作用を防ぐため、reactのcacheを無効化
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  cache: (func: any) => func,
}));

import {
  deleteAccount,
  getMyProfile,
  getProfile,
  getUser,
  updateProfile,
} from "@/features/user-profile/services/profile";

describe("user-profile/services/profile", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // auth.getUser のモックを生成
  const getUserMock = (authUser: { id: string } | null) =>
    jest
      .fn()
      .mockResolvedValue(
        authUser === null
          ? { data: null }
          : { data: { user: { id: authUser.id } } },
      );

  // select -> eq -> single のチェーンを返すテーブルAPIモックを生成
  const createTableApi = (row: { id: string; name: string }) => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: row }),
  });

  // Supabaseクライアントの汎用モック
  const createSupabaseMock = (options?: {
    userId?: string | null;
    tables?: any;
    rpc?: any;
    signOut?: jest.Mock;
  }) => ({
    from: jest.fn((table: string) => options?.tables?.[table]),
    auth: {
      getUser: getUserMock(
        options?.userId != null ? { id: options.userId } : null,
      ),
      signOut: options?.signOut ?? jest.fn(),
    },
    rpc: options?.rpc ?? jest.fn(),
  });

  // エラーハンドリングはupdateProfileのテストでカバーするため、正常系のみテスト
  describe("getUser", () => {
    it("正常系: 認証ユーザーが存在する場合、ユーザーを返す", async () => {
      (createClient as jest.Mock).mockReturnValue({
        auth: { getUser: getUserMock({ id: "user-1" }) },
      });

      const user = await getUser();
      expect(user).toEqual({ id: "user-1" });
    });
  });

  // エラーハンドリングはupdateProfileのテストでカバーするため、正常系のみテスト
  describe("getMyProfile", () => {
    it("正常系: 認証ユーザーIDでprivate_usersを検索し、行を返す", async () => {
      const tableApi = createTableApi({ id: "u-123", name: "Taro" });
      const supabaseMock = createSupabaseMock({
        userId: "u-123",
        tables: { private_users: tableApi },
      });
      (createClient as jest.Mock).mockReturnValue(supabaseMock);

      const data = await getMyProfile();
      expect(data).toEqual({ id: "u-123", name: "Taro" });
    });
  });

  //シンプルなデータ取得処理であるため、正常系のみ確認する。
  describe("getProfile", () => {
    it("正常系: 指定IDでpublic_user_profilesを検索し、行を返す", async () => {
      const tableApi = createTableApi({ id: "u-999", name: "Hanako" });
      const supabaseMock = createSupabaseMock({
        tables: { public_user_profiles: tableApi },
      });
      (createClient as jest.Mock).mockReturnValue(supabaseMock);

      const data = await getProfile("u-999");
      expect(data).toEqual({ id: "u-999", name: "Hanako" });
    });
  });

  describe("updateProfile", () => {
    const sampleUser: Tables<"private_users"> = {
      id: "u-1",
      name: "User Name",
      date_of_birth: "2000-01-01",
      address_prefecture: "東京都",
      postcode: "1000000",
      avatar_url: null,
      hubspot_contact_id: null,
      registered_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      x_username: null,
    };

    // Supabaseのprivate_usersテーブル操作用モック
    const createPrivateUsersTableMock = (
      existingRow: Tables<"private_users"> | null,
      insertReturn?: Tables<"private_users"> | null,
    ) => ({
      // select() → eq() → single() のチェーンを再現
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: existingRow }),
      // insert: 新規挿入時の戻り値
      insert: jest.fn().mockResolvedValue({
        data: insertReturn ?? existingRow,
        error: null,
      }),
      // update: 更新時のチェーン用
      update: jest.fn(),
    });

    // private_users 用の Supabase クライアントモック生成（共通化）
    // update().eq(...) の戻り値モック（共通化）
    const mockUpdateEqResult = (
      data: any,
      error: { message: string } | null = null,
    ) => jest.fn(() => ({ eq: jest.fn().mockResolvedValue({ data, error }) }));

    it("正常系: private_usersの行が存在しない場合、挿入する", async () => {
      const table = createPrivateUsersTableMock(null, sampleUser);
      const supabaseMock = createSupabaseMock({
        userId: "u-1",
        tables: { private_users: table },
      });
      (createClient as jest.Mock).mockReturnValue(supabaseMock);

      const result = await updateProfile(sampleUser);
      expect(result).toEqual(sampleUser);
    });

    it("正常系: private_usersの行が存在する場合、更新する", async () => {
      const updated = { ...sampleUser, name: "Updated" };
      // 行が存在する場合のテーブルAPIモック
      const table = {
        ...createPrivateUsersTableMock(sampleUser),
        update: mockUpdateEqResult(updated, null),
      };

      const supabaseMock = createSupabaseMock({
        userId: "u-1",
        tables: { private_users: table },
      });
      (createClient as jest.Mock).mockReturnValue(supabaseMock);

      const result = await updateProfile(sampleUser);
      expect(result).toEqual(updated);
    });

    it("異常系: 認証ユーザーが見つからない場合、例外を投げる", async () => {
      const supabaseMock = createSupabaseMock({ userId: null });
      (createClient as jest.Mock).mockReturnValue(supabaseMock);

      await expect(updateProfile(sampleUser)).rejects.toThrow(
        "ユーザー（認証）が見つかりません",
      );
    });

    it("異常系: insert/updateがエラーを返した場合、例外を投げる", async () => {
      // 既存ユーザーあり、updateでエラーを返すモック
      const table = {
        ...createPrivateUsersTableMock(sampleUser),
        update: jest.fn(() => ({
          eq: jest
            .fn()
            .mockResolvedValue({ data: null, error: { message: "boom" } }),
        })),
      };

      const supabaseMock = createSupabaseMock({
        userId: "u-1",
        tables: { private_users: table },
      });
      (createClient as jest.Mock).mockReturnValue(supabaseMock);

      await expect(updateProfile(sampleUser)).rejects.toThrow(
        "ユーザー情報の更新に失敗しました",
      );
    });
  });

  describe("deleteAccount", () => {
    it("正常系: 退会処理成功時にサインアウトする", async () => {
      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
      const signOut = jest.fn().mockResolvedValue(undefined);
      const rpc = jest.fn().mockResolvedValue({ error: null });
      const supabaseMock = createSupabaseMock({
        userId: "u-1",
        rpc,
        signOut,
      });
      (createClient as jest.Mock).mockReturnValue(supabaseMock);
      const deleteUser = jest.fn().mockResolvedValue({ error: null });
      (createAdminClient as jest.Mock).mockResolvedValue({
        auth: { admin: { deleteUser } },
      });

      await expect(deleteAccount()).resolves.toBeUndefined();
      expect(logSpy).toHaveBeenCalledWith(
        "退会処理が正常に完了しました:",
        "u-1",
      );
      logSpy.mockRestore();
    });

    it("異常系: 認証ユーザーが見つからない場合、例外を投げる", async () => {
      const supabaseMock = createSupabaseMock({ userId: null });
      (createClient as jest.Mock).mockReturnValue(supabaseMock);
      (createAdminClient as jest.Mock).mockResolvedValue({
        auth: { admin: { deleteUser: jest.fn() } },
      });

      await expect(deleteAccount()).rejects.toThrow(
        "ユーザー（認証）が見つかりません",
      );
    });

    it("異常系: RPC delete_user_accountが失敗した場合、例外を投げる", async () => {
      const rpc = jest
        .fn()
        .mockResolvedValue({ error: { message: "error_message" } });
      const supabaseMock = createSupabaseMock({ userId: "u-1", rpc });
      (createClient as jest.Mock).mockReturnValue(supabaseMock);
      (createAdminClient as jest.Mock).mockResolvedValue({
        auth: { admin: { deleteUser: jest.fn() } },
      });

      await expect(deleteAccount()).rejects.toThrow(
        "退会処理に失敗しました: error_message",
      );
    });

    it("異常系: 管理APIのdeleteUserが失敗した場合、例外を投げる", async () => {
      const rpc = jest.fn().mockResolvedValue({ error: null });
      const supabaseMock = createSupabaseMock({ userId: "u-1", rpc });
      (createClient as jest.Mock).mockReturnValue(supabaseMock);
      (createAdminClient as jest.Mock).mockResolvedValue({
        auth: {
          admin: {
            deleteUser: jest
              .fn()
              .mockResolvedValue({ error: { message: "error_message" } }),
          },
        },
      });

      await expect(deleteAccount()).rejects.toThrow(
        "認証ユーザー削除に失敗しました: error_message",
      );
    });
  });
});

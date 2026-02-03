import type { User } from "@supabase/supabase-js";
import {
  getAuthMethodDisplayName,
  isEmailUser,
  isLineUser,
} from "./auth-utils";

// LINE認証ユーザーのモック
const createLineUser = (): User => ({
  id: "line-user-id",
  aud: "authenticated",
  role: "authenticated",
  email: "line-user@example.com",
  created_at: "2024-01-01T00:00:00Z",
  app_metadata: {
    provider: "email", // LINEユーザーでもemailが設定される
  },
  user_metadata: {
    provider: "line", // LINE認証を示す
    name: "LINE User",
    line_user_id: "U1234567890",
  },
  identities: [],
});

// Email/Password認証ユーザーのモック
const createEmailUser = (): User => ({
  id: "email-user-id",
  aud: "authenticated",
  role: "authenticated",
  email: "email-user@example.com",
  created_at: "2024-01-01T00:00:00Z",
  app_metadata: {
    provider: "email",
    providers: ["email"],
  },
  user_metadata: {
    name: "Email User",
  },
  identities: [],
});

describe("auth-utils", () => {
  describe("isLineUser", () => {
    it("LINE認証ユーザーの場合はtrueを返す", () => {
      const user = createLineUser();
      expect(isLineUser(user)).toBe(true);
    });

    it("Email認証ユーザーの場合はfalseを返す", () => {
      const user = createEmailUser();
      expect(isLineUser(user)).toBe(false);
    });

    it("user_metadata.providerが存在しない場合はfalseを返す", () => {
      const user: User = {
        id: "user-id",
        aud: "authenticated",
        role: "authenticated",
        email: "user@example.com",
        created_at: "2024-01-01T00:00:00Z",
        app_metadata: {},
        user_metadata: {},
        identities: [],
      };
      expect(isLineUser(user)).toBe(false);
    });

    it("user_metadata.providerが'line'以外の場合はfalseを返す", () => {
      const user: User = {
        id: "user-id",
        aud: "authenticated",
        role: "authenticated",
        email: "user@example.com",
        created_at: "2024-01-01T00:00:00Z",
        app_metadata: {},
        user_metadata: {
          provider: "google",
        },
        identities: [],
      };
      expect(isLineUser(user)).toBe(false);
    });
  });

  describe("isEmailUser", () => {
    it("Email認証ユーザーの場合はtrueを返す", () => {
      const user = createEmailUser();
      expect(isEmailUser(user)).toBe(true);
    });

    it("LINE認証ユーザーの場合はfalseを返す", () => {
      const user = createLineUser();
      expect(isEmailUser(user)).toBe(false);
    });

    it("LINEユーザーでない場合は常にtrueを返す", () => {
      const user: User = {
        id: "user-id",
        aud: "authenticated",
        role: "authenticated",
        email: "user@example.com",
        created_at: "2024-01-01T00:00:00Z",
        app_metadata: {},
        user_metadata: {},
        identities: [],
      };
      expect(isEmailUser(user)).toBe(true);
    });
  });

  describe("getAuthMethodDisplayName", () => {
    it("LINE認証ユーザーの場合は'LINEログイン'を返す", () => {
      const user = createLineUser();
      expect(getAuthMethodDisplayName(user)).toBe("LINEログイン");
    });

    it("Email認証ユーザーの場合は'メールアドレスログイン'を返す", () => {
      const user = createEmailUser();
      expect(getAuthMethodDisplayName(user)).toBe("メールアドレスログイン");
    });

    it("プロバイダー情報がない場合は'メールアドレスログイン'を返す", () => {
      const user: User = {
        id: "user-id",
        aud: "authenticated",
        role: "authenticated",
        email: "user@example.com",
        created_at: "2024-01-01T00:00:00Z",
        app_metadata: {},
        user_metadata: {},
        identities: [],
      };
      expect(getAuthMethodDisplayName(user)).toBe("メールアドレスログイン");
    });
  });

  describe("統合テスト: LINEユーザーがapp_metadata.provider='email'を持つケース", () => {
    it("user_metadata.provider='line'が優先され、正しくLINEユーザーと判定される", () => {
      const user: User = {
        id: "line-user-id",
        aud: "authenticated",
        role: "authenticated",
        email: "line-user@example.com",
        created_at: "2024-01-01T00:00:00Z",
        app_metadata: {
          provider: "email", // Supabaseが自動設定する可能性がある
        },
        user_metadata: {
          provider: "line", // 明示的に設定される
          line_user_id: "U1234567890",
        },
        identities: [
          {
            id: "identity-id",
            user_id: "line-user-id",
            provider: "email", // identitiesもemailになる
            identity_id: "identity-id",
            created_at: "2024-01-01T00:00:00Z",
          },
        ],
      };

      expect(isLineUser(user)).toBe(true);
      expect(isEmailUser(user)).toBe(false);
      expect(getAuthMethodDisplayName(user)).toBe("LINEログイン");
    });
  });
});

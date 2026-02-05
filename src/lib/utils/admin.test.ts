import type { User } from "@supabase/supabase-js";
import { isAdmin, isPostingAdmin } from "./admin";

// テスト用Userオブジェクトを作成するヘルパー
function createUser(overrides: Partial<User> = {}): User {
  return {
    id: "test-user-id",
    aud: "authenticated",
    role: "authenticated",
    email: "test@example.com",
    created_at: "2024-01-01T00:00:00Z",
    app_metadata: {},
    user_metadata: {},
    identities: [],
    ...overrides,
  };
}

describe("isAdmin", () => {
  it("rolesにadminが含まれる場合はtrueを返す", () => {
    const user = createUser({
      app_metadata: { roles: ["admin"] },
    });
    expect(isAdmin(user)).toBe(true);
  });

  it("rolesに複数ロールがありadminが含まれる場合はtrueを返す", () => {
    const user = createUser({
      app_metadata: { roles: ["user", "admin", "posting-admin"] },
    });
    expect(isAdmin(user)).toBe(true);
  });

  it("rolesにadminが含まれない場合はfalseを返す", () => {
    const user = createUser({
      app_metadata: { roles: ["user"] },
    });
    expect(isAdmin(user)).toBe(false);
  });

  it("rolesが空配列の場合はfalseを返す", () => {
    const user = createUser({
      app_metadata: { roles: [] },
    });
    expect(isAdmin(user)).toBe(false);
  });

  it("rolesが配列でない場合はfalseを返す", () => {
    const user = createUser({
      app_metadata: { roles: "admin" },
    });
    expect(isAdmin(user)).toBe(false);
  });

  it("app_metadataにrolesがない場合はfalseを返す", () => {
    const user = createUser({
      app_metadata: {},
    });
    expect(isAdmin(user)).toBe(false);
  });

  it("nullの場合はfalseを返す", () => {
    expect(isAdmin(null)).toBe(false);
  });
});

describe("isPostingAdmin", () => {
  it("rolesにposting-adminが含まれる場合はtrueを返す", () => {
    const user = createUser({
      app_metadata: { roles: ["posting-admin"] },
    });
    expect(isPostingAdmin(user)).toBe(true);
  });

  it("rolesに複数ロールがありposting-adminが含まれる場合はtrueを返す", () => {
    const user = createUser({
      app_metadata: { roles: ["admin", "posting-admin"] },
    });
    expect(isPostingAdmin(user)).toBe(true);
  });

  it("rolesにposting-adminが含まれない場合はfalseを返す", () => {
    const user = createUser({
      app_metadata: { roles: ["admin"] },
    });
    expect(isPostingAdmin(user)).toBe(false);
  });

  it("nullの場合はfalseを返す", () => {
    expect(isPostingAdmin(null)).toBe(false);
  });
});

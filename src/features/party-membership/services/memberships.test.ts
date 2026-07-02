import { createAdminClient } from "@/lib/supabase/adminClient";
import type { PartyMembership } from "../types";
import { getPartyMembershipByEmail } from "./memberships";

jest.mock("@/lib/supabase/adminClient", () => ({
  createAdminClient: jest.fn(),
}));

const mockCreateAdminClient = createAdminClient as jest.Mock;

type MockAdminOptions = {
  users?: Array<{ id: string; email: string }>;
  userError?: { message: string } | null;
  membership?: Partial<PartyMembership> | null;
  membershipError?: { message: string } | null;
};

function setupMockAdminClient({
  users = [],
  userError = null,
  membership = null,
  membershipError = null,
}: MockAdminOptions = {}) {
  const rpc = jest.fn().mockResolvedValue({ data: users, error: userError });
  const maybeSingle = jest
    .fn()
    .mockResolvedValue({ data: membership, error: membershipError });
  const eq = jest.fn().mockReturnValue({ maybeSingle });
  const select = jest.fn().mockReturnValue({ eq });
  const from = jest.fn().mockReturnValue({ select });

  mockCreateAdminClient.mockResolvedValue({ rpc, from });

  return { rpc, from, eq };
}

describe("getPartyMembershipByEmail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("空文字のemailの場合、DBに問い合わせずuserExists: falseを返す", async () => {
    const { rpc } = setupMockAdminClient();

    const result = await getPartyMembershipByEmail("   ");

    expect(result).toEqual({
      userExists: false,
      userId: null,
      membership: null,
    });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("emailを小文字・trimに正規化してRPCに渡す", async () => {
    const { rpc } = setupMockAdminClient();

    await getPartyMembershipByEmail("  Tanaka.Hanako@Example.com ");

    expect(rpc).toHaveBeenCalledWith("get_users_by_emails", {
      email_list: ["tanaka.hanako@example.com"],
    });
  });

  it("ユーザーが見つからない場合、userExists: falseを返す", async () => {
    setupMockAdminClient({ users: [] });

    const result = await getPartyMembershipByEmail("unknown@example.com");

    expect(result).toEqual({
      userExists: false,
      userId: null,
      membership: null,
    });
  });

  it("ユーザーはいるが党員データがない場合、membership: nullを返す", async () => {
    const { eq } = setupMockAdminClient({
      users: [{ id: "user-1", email: "user@example.com" }],
      membership: null,
    });

    const result = await getPartyMembershipByEmail("user@example.com");

    expect(result).toEqual({
      userExists: true,
      userId: "user-1",
      membership: null,
    });
    expect(eq).toHaveBeenCalledWith("user_id", "user-1");
  });

  it("党員データがある場合、membershipを返す", async () => {
    const membership = {
      user_id: "user-1",
      plan: "regular",
      badge_visibility: true,
    };
    setupMockAdminClient({
      users: [{ id: "user-1", email: "user@example.com" }],
      membership,
    });

    const result = await getPartyMembershipByEmail("user@example.com");

    expect(result).toEqual({
      userExists: true,
      userId: "user-1",
      membership,
    });
  });

  it("ユーザー検索のRPCが失敗した場合、エラーをthrowする", async () => {
    setupMockAdminClient({ userError: { message: "rpc failed" } });

    await expect(getPartyMembershipByEmail("user@example.com")).rejects.toThrow(
      "ユーザーの検索に失敗しました: rpc failed",
    );
  });

  it("党員情報の取得が失敗した場合、エラーをthrowする", async () => {
    setupMockAdminClient({
      users: [{ id: "user-1", email: "user@example.com" }],
      membershipError: { message: "query failed" },
    });

    await expect(getPartyMembershipByEmail("user@example.com")).rejects.toThrow(
      "党員情報の取得に失敗しました: query failed",
    );
  });
});

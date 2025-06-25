jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

jest.mock("react", () => ({
  cache: (fn: any) => fn,
}));

import { getMyProfile, getProfile, getUser, updateProfile } from "./users";

const { createClient } = require("@/lib/supabase/server");
const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  insert: jest.fn(),
  update: jest.fn().mockReturnThis(),
};

describe("users service", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockCreateClient.mockResolvedValue(mockSupabase);

    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
    mockSupabase.update.mockReturnThis();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUser", () => {
    it("認証されたユーザーを返す", async () => {
      const mockUser = { id: "user-1", email: "test@example.com" };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const result = await getUser();

      expect(result).toEqual(mockUser);
      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    });

    it("認証されていない場合はnullを返す", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const result = await getUser();

      expect(result).toBeNull();
    });
  });

  describe("getMyProfile", () => {
    it("自分のプロファイルを返す", async () => {
      const mockUser = { id: "user-1", email: "test@example.com" };
      const mockProfile = { id: "user-1", name: "テストユーザー" };

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.single.mockResolvedValue({ data: mockProfile });

      const result = await getMyProfile();

      expect(result).toEqual(mockProfile);
      expect(mockSupabase.from).toHaveBeenCalledWith("private_users");
      expect(mockSupabase.eq).toHaveBeenCalledWith("id", "user-1");
    });

    it("ユーザーが見つからない場合はエラーを投げる", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      await expect(getMyProfile()).rejects.toThrow(
        "ユーザー（認証）が見つかりません",
      );
    });
  });

  describe("getProfile", () => {
    it("指定されたユーザーのプロファイルを返す", async () => {
      const mockProfile = { id: "user-1", name: "テストユーザー" };
      mockSupabase.single.mockResolvedValue({ data: mockProfile });

      const result = await getProfile("user-1");

      expect(result).toEqual(mockProfile);
      expect(mockSupabase.from).toHaveBeenCalledWith("public_user_profiles");
      expect(mockSupabase.eq).toHaveBeenCalledWith("id", "user-1");
    });
  });

  describe("updateProfile", () => {
    const mockUser: any = {
      id: "user-1",
      name: "更新されたユーザー",
      email: "updated@example.com",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
      address_prefecture: null,
      address_city: null,
      address_town: null,
      address_street: null,
      phone_number: null,
      birth_date: null,
      gender: null,
      occupation: null,
      political_affiliation: null,
      volunteer_experience: null,
      motivation: null,
      skills: null,
      availability: null,
      preferred_activities: null,
      emergency_contact_name: null,
      emergency_contact_phone: null,
      emergency_contact_relationship: null,
      terms_accepted: false,
      privacy_policy_accepted: false,
      marketing_emails_accepted: false,
      hubspot_contact_id: null,
    };

    it("既存ユーザーのプロファイルを更新する", async () => {
      const mockAuthUser = { id: "user-1" };
      const mockExistingProfile = { id: "user-1", name: "既存ユーザー" };
      const mockUpdatedProfile = { id: "user-1", name: "更新されたユーザー" };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
      });
      mockSupabase.single.mockResolvedValue({
        data: mockExistingProfile,
        error: null,
      });
      mockSupabase.update.mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: mockUpdatedProfile,
          error: null,
        }),
      });

      const result = await updateProfile(mockUser);

      expect(result).toEqual(mockUpdatedProfile);
      expect(mockSupabase.update).toHaveBeenCalledWith(mockUser);
    });

    it("新規ユーザーのプロファイルを作成する", async () => {
      const mockAuthUser = { id: "user-1" };
      const mockCreatedProfile = { id: "user-1", name: "新規ユーザー" };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
      });
      mockSupabase.single.mockResolvedValue({ data: null });
      mockSupabase.insert.mockResolvedValue({
        data: [mockCreatedProfile],
        error: null,
      });

      const result = await updateProfile(mockUser);

      expect(result).toEqual([mockCreatedProfile]);
      expect(mockSupabase.insert).toHaveBeenCalledWith(mockUser);
    });

    it("認証ユーザーが見つからない場合はエラーを投げる", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: null });

      await expect(updateProfile(mockUser)).rejects.toThrow(
        "ユーザー（認証）が見つかりません",
      );
    });

    it("更新エラーが発生した場合はエラーを投げる", async () => {
      const mockAuthUser = { id: "user-1" };
      const mockExistingProfile = { id: "user-1", name: "既存ユーザー" };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
      });
      mockSupabase.single.mockResolvedValue({
        data: mockExistingProfile,
        error: null,
      });
      mockSupabase.update.mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "更新エラー" },
        }),
      });

      await expect(updateProfile(mockUser)).rejects.toThrow(
        "ユーザー情報の更新に失敗しました",
      );
    });
  });
});

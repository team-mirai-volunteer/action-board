const mockGetUser = jest.fn();
const mockReverseGeocode = jest.fn();
const mockCreatePosterPlacement = jest.fn();
const mockDeletePosterPlacement = jest.fn();
const mockGetPosterPlacementById = jest.fn();
const mockUpdatePosterPlacementArtifactId = jest.fn();
const mockAchievePosterPlacementMission = jest.fn();
const mockCreateAdminClient = jest.fn();

jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

jest.mock("@/lib/supabase/adminClient", () => ({
  createAdminClient: (...args: unknown[]) => mockCreateAdminClient(...args),
}));

jest.mock("@/features/map-posting/services/reverse-geocoding", () => ({
  reverseGeocode: (...args: unknown[]) => mockReverseGeocode(...args),
}));

jest.mock("../services/poster-placements", () => ({
  createPosterPlacement: (...args: unknown[]) =>
    mockCreatePosterPlacement(...args),
  deletePosterPlacement: (...args: unknown[]) =>
    mockDeletePosterPlacement(...args),
  getPosterPlacementById: (...args: unknown[]) =>
    mockGetPosterPlacementById(...args),
  updatePosterPlacementArtifactId: (...args: unknown[]) =>
    mockUpdatePosterPlacementArtifactId(...args),
}));

jest.mock("../use-cases/achieve-poster-placement-mission", () => ({
  achievePosterPlacementMission: (...args: unknown[]) =>
    mockAchievePosterPlacementMission(...args),
}));

import {
  removePosterPlacement,
  submitPosterPlacement,
} from "./poster-placement-actions";

const mockUser = { id: "user-1", email: "test@example.com" };

beforeEach(() => {
  jest.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: mockUser } });
  mockReverseGeocode.mockResolvedValue({
    prefecture: "東京都",
    city: "渋谷区",
    address: "道玄坂",
    postcode: "150-0043",
  });
  mockCreateAdminClient.mockResolvedValue({});
  mockAchievePosterPlacementMission.mockResolvedValue({
    success: true,
    artifactId: "artifact-1",
    xpGranted: 100,
  });
});

describe("submitPosterPlacement", () => {
  it("正常に登録できる", async () => {
    mockCreatePosterPlacement.mockResolvedValue({ id: "placement-1" });
    mockUpdatePosterPlacementArtifactId.mockResolvedValue(undefined);

    const result = await submitPosterPlacement({
      lat: 35.6762,
      lng: 139.6503,
      count: 2,
      address: null,
      memo: "テスト",
    });

    expect(result).toEqual({ success: true, id: "placement-1" });
    expect(mockCreatePosterPlacement).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        lat: 35.6762,
        lng: 139.6503,
        count: 2,
        memo: "テスト",
      }),
    );
  });

  it("addressが指定されたらgeoのaddressより優先される", async () => {
    mockCreatePosterPlacement.mockResolvedValue({ id: "placement-1" });

    await submitPosterPlacement({
      lat: 35,
      lng: 139,
      count: 1,
      address: "カスタム住所",
      memo: null,
    });

    expect(mockCreatePosterPlacement).toHaveBeenCalledWith(
      expect.objectContaining({ address: "カスタム住所" }),
    );
  });

  it("未認証の場合は失敗", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const result = await submitPosterPlacement({
      lat: 35,
      lng: 139,
      count: 1,
      address: null,
      memo: null,
    });

    expect(result).toEqual({ success: false, error: "認証が必要です" });
  });

  it("ミッション達成失敗でもポスター掲示は成功する", async () => {
    mockCreatePosterPlacement.mockResolvedValue({ id: "placement-1" });
    mockAchievePosterPlacementMission.mockResolvedValue({
      success: false,
      error: "ミッションエラー",
    });

    const result = await submitPosterPlacement({
      lat: 35,
      lng: 139,
      count: 1,
      address: null,
      memo: null,
    });

    expect(result).toEqual({ success: true, id: "placement-1" });
  });
});

describe("removePosterPlacement", () => {
  it("正常に削除できる", async () => {
    mockGetPosterPlacementById.mockResolvedValue({
      id: "placement-1",
      user_id: "user-1",
    });
    mockDeletePosterPlacement.mockResolvedValue(undefined);

    const result = await removePosterPlacement("placement-1");
    expect(result).toEqual({ success: true });
  });

  it("レコードが見つからない場合は失敗", async () => {
    mockGetPosterPlacementById.mockResolvedValue(null);

    const result = await removePosterPlacement("missing");
    expect(result).toEqual({
      success: false,
      error: "レコードが見つかりません",
    });
  });

  it("他ユーザーのレコードは削除できない", async () => {
    mockGetPosterPlacementById.mockResolvedValue({
      id: "placement-1",
      user_id: "other-user",
    });

    const result = await removePosterPlacement("placement-1");
    expect(result).toEqual({
      success: false,
      error: "削除する権限がありません",
    });
  });

  it("未認証の場合は失敗", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const result = await removePosterPlacement("placement-1");
    expect(result).toEqual({ success: false, error: "認証が必要です" });
  });
});

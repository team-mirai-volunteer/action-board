const mockGetUser = jest.fn();
const mockReverseGeocode = jest.fn();
const mockCreatePosterPlacement = jest.fn();
const mockDeletePosterPlacement = jest.fn();
const mockGetPosterPlacementById = jest.fn();
const mockUpdatePosterPlacementArtifactId = jest.fn();
const mockUpdatePosterPlacementFields = jest.fn();
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

jest.mock("@/lib/services/reverse-geocoding", () => ({
  reverseGeocode: (...args: unknown[]) => mockReverseGeocode(...args),
}));

jest.mock("../services/residential-posters", () => ({
  createPosterPlacement: (...args: unknown[]) =>
    mockCreatePosterPlacement(...args),
  deletePosterPlacement: (...args: unknown[]) =>
    mockDeletePosterPlacement(...args),
  getPosterPlacementById: (...args: unknown[]) =>
    mockGetPosterPlacementById(...args),
  updatePosterPlacementArtifactId: (...args: unknown[]) =>
    mockUpdatePosterPlacementArtifactId(...args),
  updatePosterPlacementFields: (...args: unknown[]) =>
    mockUpdatePosterPlacementFields(...args),
}));

jest.mock("../use-cases/achieve-residential-poster-mission", () => ({
  achievePosterPlacementMission: (...args: unknown[]) =>
    mockAchievePosterPlacementMission(...args),
}));

import {
  removePosterPlacement,
  submitPosterPlacement,
  updatePosterPlacement,
} from "./residential-poster-actions";

const mockUser = { id: "user-1", email: "test@example.com" };

/** テスト入力の共通ファクトリ */
function buildPlacementInput(
  overrides: Partial<{
    lat: number;
    lng: number;
    count: number;
    address: string | null;
    memo: string | null;
    placed_date: string | null;
    location_type: string | null;
    poster_type: string | null;
    is_removed: boolean;
  }> = {},
) {
  return {
    lat: 35,
    lng: 139,
    count: 1,
    address: null as string | null,
    memo: null as string | null,
    placed_date: null as string | null,
    location_type: "home" as string | null,
    poster_type: "leader_face_a1" as string | null,
    is_removed: false,
    ...overrides,
  };
}

/** updatePosterPlacement用の共通ファクトリ */
function buildUpdateInput(
  overrides: Partial<{
    count: number;
    address: string | null;
    memo: string | null;
    placed_date: string | null;
    location_type: string | null;
    poster_type: string | null;
    is_removed: boolean;
  }> = {},
) {
  return {
    count: 1,
    address: null as string | null,
    memo: null as string | null,
    placed_date: null as string | null,
    location_type: "home" as string | null,
    poster_type: "leader_face_a1" as string | null,
    is_removed: false,
    ...overrides,
  };
}

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

    const result = await submitPosterPlacement(
      buildPlacementInput({
        lat: 35.6762,
        lng: 139.6503,
        count: 2,
        memo: "テスト",
      }),
    );

    expect(result).toEqual({ success: true, id: "placement-1" });
    expect(mockCreatePosterPlacement).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        lat: 35.6762,
        lng: 139.6503,
        count: 2,
        memo: "テスト",
        placed_date: null,
        location_type: "home",
        poster_type: "leader_face_a1",
        is_removed: false,
      }),
    );
  });

  it("新しいフィールドが正しく渡される", async () => {
    mockCreatePosterPlacement.mockResolvedValue({ id: "placement-2" });
    mockUpdatePosterPlacementArtifactId.mockResolvedValue(undefined);

    const result = await submitPosterPlacement(
      buildPlacementInput({
        lat: 35.6762,
        lng: 139.6503,
        placed_date: "2026-04-10",
        location_type: "home",
        poster_type: "leader_face_a1",
        is_removed: true,
      }),
    );

    expect(result).toEqual({ success: true, id: "placement-2" });
    expect(mockCreatePosterPlacement).toHaveBeenCalledWith(
      expect.objectContaining({
        placed_date: "2026-04-10",
        location_type: "home",
        poster_type: "leader_face_a1",
        is_removed: true,
      }),
    );
  });

  it("addressが指定されたらgeoのaddressより優先される", async () => {
    mockCreatePosterPlacement.mockResolvedValue({ id: "placement-1" });

    await submitPosterPlacement(
      buildPlacementInput({ address: "カスタム住所" }),
    );

    expect(mockCreatePosterPlacement).toHaveBeenCalledWith(
      expect.objectContaining({ address: "カスタム住所" }),
    );
  });

  it("未認証の場合は失敗", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const result = await submitPosterPlacement(buildPlacementInput());

    expect(result).toEqual({ success: false, error: "認証が必要です" });
  });

  it("poster_typeがnullなら失敗", async () => {
    const result = await submitPosterPlacement(
      buildPlacementInput({ poster_type: null }),
    );

    expect(result).toEqual({
      success: false,
      error: "ポスターの種類を選択してください",
    });
    expect(mockCreatePosterPlacement).not.toHaveBeenCalled();
  });

  it("poster_typeが許可値以外なら失敗", async () => {
    const result = await submitPosterPlacement(
      buildPlacementInput({ poster_type: "unknown_poster" }),
    );

    expect(result).toEqual({
      success: false,
      error: "ポスターの種類を選択してください",
    });
    expect(mockCreatePosterPlacement).not.toHaveBeenCalled();
  });

  it("location_typeがnullなら失敗", async () => {
    const result = await submitPosterPlacement(
      buildPlacementInput({ location_type: null }),
    );

    expect(result).toEqual({
      success: false,
      error: "種別を選択してください",
    });
    expect(mockCreatePosterPlacement).not.toHaveBeenCalled();
  });

  it("location_typeが許可値以外なら失敗", async () => {
    const result = await submitPosterPlacement(
      buildPlacementInput({ location_type: "unknown_location" }),
    );

    expect(result).toEqual({
      success: false,
      error: "種別を選択してください",
    });
    expect(mockCreatePosterPlacement).not.toHaveBeenCalled();
  });

  it("ミッション達成失敗でもポスター掲示は成功する", async () => {
    mockCreatePosterPlacement.mockResolvedValue({ id: "placement-1" });
    mockAchievePosterPlacementMission.mockResolvedValue({
      success: false,
      error: "ミッションエラー",
    });

    const result = await submitPosterPlacement(buildPlacementInput());

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

describe("updatePosterPlacement", () => {
  it("正常に更新できる", async () => {
    mockGetPosterPlacementById.mockResolvedValue({
      id: "placement-1",
      user_id: "user-1",
    });
    mockUpdatePosterPlacementFields.mockResolvedValue(undefined);

    const result = await updatePosterPlacement(
      "placement-1",
      buildUpdateInput({
        count: 3,
        address: "新しい住所",
        memo: "メモ更新",
        placed_date: "2026-04-10",
        location_type: "store_office",
        poster_type: "logo_a2",
      }),
    );

    expect(result).toEqual({ success: true });
    expect(mockUpdatePosterPlacementFields).toHaveBeenCalledWith(
      "placement-1",
      {
        count: 3,
        address: "新しい住所",
        memo: "メモ更新",
        placed_date: "2026-04-10",
        location_type: "store_office",
        poster_type: "logo_a2",
        is_removed: false,
      },
    );
  });

  it("poster_typeがnullなら失敗", async () => {
    const result = await updatePosterPlacement(
      "placement-1",
      buildUpdateInput({ poster_type: null }),
    );

    expect(result).toEqual({
      success: false,
      error: "ポスターの種類を選択してください",
    });
    expect(mockUpdatePosterPlacementFields).not.toHaveBeenCalled();
  });

  it("poster_typeが許可値以外なら失敗", async () => {
    const result = await updatePosterPlacement(
      "placement-1",
      buildUpdateInput({ poster_type: "unknown_poster" }),
    );

    expect(result).toEqual({
      success: false,
      error: "ポスターの種類を選択してください",
    });
    expect(mockUpdatePosterPlacementFields).not.toHaveBeenCalled();
  });

  it("location_typeがnullなら失敗", async () => {
    const result = await updatePosterPlacement(
      "placement-1",
      buildUpdateInput({ location_type: null }),
    );

    expect(result).toEqual({
      success: false,
      error: "種別を選択してください",
    });
    expect(mockUpdatePosterPlacementFields).not.toHaveBeenCalled();
  });

  it("location_typeが許可値以外なら失敗", async () => {
    const result = await updatePosterPlacement(
      "placement-1",
      buildUpdateInput({ location_type: "unknown_location" }),
    );

    expect(result).toEqual({
      success: false,
      error: "種別を選択してください",
    });
    expect(mockUpdatePosterPlacementFields).not.toHaveBeenCalled();
  });

  it("他ユーザーのレコードは更新できない", async () => {
    mockGetPosterPlacementById.mockResolvedValue({
      id: "placement-1",
      user_id: "other-user",
    });

    const result = await updatePosterPlacement(
      "placement-1",
      buildUpdateInput(),
    );

    expect(result).toEqual({
      success: false,
      error: "更新する権限がありません",
    });
    expect(mockUpdatePosterPlacementFields).not.toHaveBeenCalled();
  });

  it("レコードが見つからない場合は失敗", async () => {
    mockGetPosterPlacementById.mockResolvedValue(null);

    const result = await updatePosterPlacement("missing", buildUpdateInput());

    expect(result).toEqual({
      success: false,
      error: "レコードが見つかりません",
    });
    expect(mockUpdatePosterPlacementFields).not.toHaveBeenCalled();
  });

  it("未認証の場合は失敗", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const result = await updatePosterPlacement(
      "placement-1",
      buildUpdateInput(),
    );

    expect(result).toEqual({ success: false, error: "認証が必要です" });
    expect(mockUpdatePosterPlacementFields).not.toHaveBeenCalled();
  });
});

import { ARTIFACT_TYPES } from "@/lib/types/artifact-types";

// achieveMissionは呼ばれない想定（バリデーション失敗で早期return）だが、
// 念のためモック化してDBアクセスを完全に遮断する
jest.mock("../use-cases/achieve-mission", () => ({
  achieveMission: jest.fn(),
}));
jest.mock("../use-cases/cancel-submission", () => ({
  cancelSubmission: jest.fn(),
}));
jest.mock("./quiz-actions", () => ({
  checkQuizAnswersAction: jest.fn(),
  getMissionQuizCategoryAction: jest.fn(),
  getQuizQuestionsAction: jest.fn(),
}));

import { achieveMissionAction } from "./actions";

function buildFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    fd.set(k, v);
  }
  return fd;
}

describe("achieveMissionAction — RESIDENTIAL_POSTER バリデーション", () => {
  it("locationTypeが空なら『種別を選択してください』エラーを返す", async () => {
    const fd = buildFormData({
      missionId: "mission-1",
      requiredArtifactType: ARTIFACT_TYPES.RESIDENTIAL_POSTER.key,
      residentialPosterCount: "3",
      locationType: "",
      posterType: "leader_face_a1",
      placedDate: "2026-04-16",
      locationText: "1540017",
    });

    const result = await achieveMissionAction(fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("種別を選択してください");
    }
  });

  it("posterTypeが空なら『ポスターの種類を選択してください』エラーを返す", async () => {
    const fd = buildFormData({
      missionId: "mission-1",
      requiredArtifactType: ARTIFACT_TYPES.RESIDENTIAL_POSTER.key,
      residentialPosterCount: "3",
      locationType: "home",
      posterType: "",
      placedDate: "2026-04-16",
      locationText: "1540017",
    });

    const result = await achieveMissionAction(fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("ポスターの種類を選択してください");
    }
  });

  it("placedDateが空なら『日付を入力してください』エラーを返す", async () => {
    const fd = buildFormData({
      missionId: "mission-1",
      requiredArtifactType: ARTIFACT_TYPES.RESIDENTIAL_POSTER.key,
      residentialPosterCount: "3",
      locationType: "home",
      posterType: "leader_face_a1",
      placedDate: "",
      locationText: "1540017",
    });

    const result = await achieveMissionAction(fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("日付を入力してください");
    }
  });

  it("locationTextが空なら『郵便番号を入力してください』エラーを返す", async () => {
    const fd = buildFormData({
      missionId: "mission-1",
      requiredArtifactType: ARTIFACT_TYPES.RESIDENTIAL_POSTER.key,
      residentialPosterCount: "3",
      locationType: "home",
      posterType: "leader_face_a1",
      placedDate: "2026-04-16",
      locationText: "",
    });

    const result = await achieveMissionAction(fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("郵便番号を入力してください");
    }
  });

  it("locationTextが7桁数字でないなら書式エラーを返す", async () => {
    const fd = buildFormData({
      missionId: "mission-1",
      requiredArtifactType: ARTIFACT_TYPES.RESIDENTIAL_POSTER.key,
      residentialPosterCount: "3",
      locationType: "home",
      posterType: "leader_face_a1",
      placedDate: "2026-04-16",
      locationText: "154-0017",
    });

    const result = await achieveMissionAction(fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain(
        "郵便番号はハイフンなし7桁で入力をお願いします",
      );
    }
  });

  it("全フィールドが有効な場合はバリデーションをパスし、認証エラーを返す（未ログイン）", async () => {
    // jest.setup.js で createClient.auth.getUser() が user: null を返すよう設定済み
    const fd = buildFormData({
      missionId: "mission-1",
      requiredArtifactType: ARTIFACT_TYPES.RESIDENTIAL_POSTER.key,
      residentialPosterCount: "3",
      locationType: "home",
      posterType: "leader_face_a1",
      placedDate: "2026-04-16",
      locationText: "1540017",
    });

    const result = await achieveMissionAction(fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("認証エラーが発生しました。");
    }
  });
});

import { getMissionSubmissionState } from "./mission-submission";

describe("getMissionSubmissionState", () => {
  it("max_achievement_countがnullの場合は提出可能", () => {
    const result = getMissionSubmissionState(null, 0);
    expect(result).toEqual({
      buttonLabel: "ミッション完了を記録する",
      isButtonDisabled: false,
      hasReachedUserMaxAchievements: false,
    });
  });

  it("max_achievement_countがnullで達成回数が多くても提出可能", () => {
    const result = getMissionSubmissionState(null, 100);
    expect(result).toEqual({
      buttonLabel: "ミッション完了を記録する",
      isButtonDisabled: false,
      hasReachedUserMaxAchievements: false,
    });
  });

  it("達成回数が上限未満の場合は提出可能", () => {
    const result = getMissionSubmissionState(3, 2);
    expect(result).toEqual({
      buttonLabel: "ミッション完了を記録する",
      isButtonDisabled: false,
      hasReachedUserMaxAchievements: false,
    });
  });

  it("達成回数が上限に達した場合は完了済み", () => {
    const result = getMissionSubmissionState(3, 3);
    expect(result).toEqual({
      buttonLabel: "このミッションは完了済みです",
      isButtonDisabled: true,
      hasReachedUserMaxAchievements: true,
    });
  });

  it("達成回数が上限を超えている場合も完了済み", () => {
    const result = getMissionSubmissionState(1, 5);
    expect(result).toEqual({
      buttonLabel: "このミッションは完了済みです",
      isButtonDisabled: true,
      hasReachedUserMaxAchievements: true,
    });
  });

  it("上限が0の場合は達成回数0でも完了済み", () => {
    const result = getMissionSubmissionState(0, 0);
    expect(result).toEqual({
      buttonLabel: "このミッションは完了済みです",
      isButtonDisabled: true,
      hasReachedUserMaxAchievements: true,
    });
  });

  it("上限が1で達成回数0の場合は提出可能", () => {
    const result = getMissionSubmissionState(1, 0);
    expect(result).toEqual({
      buttonLabel: "ミッション完了を記録する",
      isButtonDisabled: false,
      hasReachedUserMaxAchievements: false,
    });
  });
});

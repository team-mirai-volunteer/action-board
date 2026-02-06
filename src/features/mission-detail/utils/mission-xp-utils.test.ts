import { BONUS_MISSION_SLUGS, isBonusMission } from "./mission-xp-utils";

describe("isBonusMission", () => {
  it("posting-magazine はボーナス対象", () => {
    expect(isBonusMission("posting-magazine")).toBe(true);
  });

  it("put-up-poster-on-board はボーナス対象", () => {
    expect(isBonusMission("put-up-poster-on-board")).toBe(true);
  });

  it("posting-activity-magazine はボーナス対象", () => {
    expect(isBonusMission("posting-activity-magazine")).toBe(true);
  });

  it("一般的なスラグはボーナス対象外", () => {
    expect(isBonusMission("some-other-mission")).toBe(false);
  });

  it("空文字はボーナス対象外", () => {
    expect(isBonusMission("")).toBe(false);
  });
});

describe("BONUS_MISSION_SLUGS", () => {
  it("3つのスラグを含む", () => {
    expect(BONUS_MISSION_SLUGS).toHaveLength(3);
    expect(BONUS_MISSION_SLUGS).toContain("posting-magazine");
    expect(BONUS_MISSION_SLUGS).toContain("put-up-poster-on-board");
    expect(BONUS_MISSION_SLUGS).toContain("posting-activity-magazine");
  });
});

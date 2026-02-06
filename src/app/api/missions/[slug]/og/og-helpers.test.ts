import { formatTitleWithLineBreaks, isVotingMission } from "./og-helpers";

describe("formatTitleWithLineBreaks", () => {
  it("returns title unchanged when no brackets present", () => {
    expect(formatTitleWithLineBreaks("テスト")).toBe("テスト");
  });

  it("inserts line break before full-width brackets", () => {
    expect(formatTitleWithLineBreaks("ミッション（初級）")).toBe(
      "ミッション\n（初級）",
    );
  });

  it("inserts line break before half-width brackets", () => {
    expect(formatTitleWithLineBreaks("Mission(beginner)")).toBe(
      "Mission\n(beginner)",
    );
  });

  it("handles multiple full-width brackets", () => {
    expect(formatTitleWithLineBreaks("タイトル（A）と（B）")).toBe(
      "タイトル\n（A）と\n（B）",
    );
  });

  it("handles multiple half-width brackets", () => {
    expect(formatTitleWithLineBreaks("Title(A)and(B)")).toBe(
      "Title\n(A)and\n(B)",
    );
  });

  it("handles mixed bracket types", () => {
    expect(formatTitleWithLineBreaks("タイトル（A）and(B)")).toBe(
      "タイトル\n（A）and\n(B)",
    );
  });

  it("returns empty string for empty input", () => {
    expect(formatTitleWithLineBreaks("")).toBe("");
  });
});

describe("isVotingMission", () => {
  it("returns true for early-vote", () => {
    expect(isVotingMission("early-vote")).toBe(true);
  });

  it("returns true for absent-vote", () => {
    expect(isVotingMission("absent-vote")).toBe(true);
  });

  it("returns true for overseas-vote", () => {
    expect(isVotingMission("overseas-vote")).toBe(true);
  });

  it("returns false for non-voting slug", () => {
    expect(isVotingMission("some-other-mission")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isVotingMission("")).toBe(false);
  });

  it("returns false for partial match", () => {
    expect(isVotingMission("early-vote-extra")).toBe(false);
    expect(isVotingMission("vote")).toBe(false);
  });
});

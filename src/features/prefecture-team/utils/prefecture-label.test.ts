import { getPrefectureInternalLabel } from "./prefecture-label";

describe("getPrefectureInternalLabel", () => {
  test("returns 都内 for 東京都", () => {
    expect(getPrefectureInternalLabel("東京都")).toBe("都内");
  });

  test("returns 道内 for 北海道", () => {
    expect(getPrefectureInternalLabel("北海道")).toBe("道内");
  });

  test("returns 府内 for 大阪府", () => {
    expect(getPrefectureInternalLabel("大阪府")).toBe("府内");
  });

  test("returns 府内 for 京都府", () => {
    expect(getPrefectureInternalLabel("京都府")).toBe("府内");
  });

  test("returns 県内 for standard prefectures", () => {
    expect(getPrefectureInternalLabel("神奈川県")).toBe("県内");
    expect(getPrefectureInternalLabel("愛知県")).toBe("県内");
    expect(getPrefectureInternalLabel("福岡県")).toBe("県内");
  });
});

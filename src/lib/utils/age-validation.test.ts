import { validateAge } from "./age-validation";

describe("validateAge", () => {
  beforeEach(() => {
    // 2026-06-15 に固定
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-15"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("18歳以上の場合はnullを返す", () => {
    // 2008-06-15生まれ → ちょうど18歳
    expect(validateAge("2008-06-15")).toBeNull();
  });

  it("30歳の場合はnullを返す", () => {
    expect(validateAge("1996-01-01")).toBeNull();
  });

  it("17歳の場合はエラーメッセージを返す（あと1年=もうすぐ）", () => {
    // 2008-06-16生まれ → まだ17歳（誕生日が翌日）
    const result = validateAge("2008-06-16");
    expect(result).toBe(
      "18歳以上の方のみご登録いただけます。もうすぐ登録できますので、その日を楽しみにお待ちください！",
    );
  });

  it("15歳の場合はエラーメッセージを返す（あと3年）", () => {
    // 2011-06-16生まれ → 14歳 → yearsToWait = 4 > 1 → あと4年
    // 2011-01-01生まれ → 15歳 → yearsToWait = 3 > 1 → あと3年
    const result = validateAge("2011-01-01");
    expect(result).toBe(
      "18歳以上の方のみご登録いただけます。あと3年で登録できますので、その日を楽しみにお待ちください！",
    );
  });

  it("0歳の場合はエラーメッセージを返す（あと18年）", () => {
    const result = validateAge("2026-01-01");
    expect(result).toBe(
      "18歳以上の方のみご登録いただけます。あと18年で登録できますので、その日を楽しみにお待ちください！",
    );
  });

  it("16歳の場合はエラーメッセージを返す（あと2年）", () => {
    const result = validateAge("2010-01-01");
    expect(result).toBe(
      "18歳以上の方のみご登録いただけます。あと2年で登録できますので、その日を楽しみにお待ちください！",
    );
  });
});

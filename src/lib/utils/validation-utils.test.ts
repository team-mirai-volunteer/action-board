import { formatZodErrors } from "./validation-utils";

describe("formatZodErrors", () => {
  it("単一エラーのメッセージを返す", () => {
    const zodError = {
      errors: [{ message: "メールアドレスが無効です" }],
    };
    expect(formatZodErrors(zodError)).toBe("メールアドレスが無効です");
  });

  it("複数エラーを改行区切りで結合する", () => {
    const zodError = {
      errors: [
        { message: "名前は必須です" },
        { message: "メールアドレスが無効です" },
        { message: "パスワードは8文字以上必要です" },
      ],
    };
    expect(formatZodErrors(zodError)).toBe(
      "名前は必須です\nメールアドレスが無効です\nパスワードは8文字以上必要です",
    );
  });

  it("空の配列の場合は空文字を返す", () => {
    const zodError = { errors: [] };
    expect(formatZodErrors(zodError)).toBe("");
  });

  it("エラーメッセージが空文字の場合も正しく処理する", () => {
    const zodError = {
      errors: [{ message: "" }, { message: "エラー" }],
    };
    expect(formatZodErrors(zodError)).toBe("\nエラー");
  });
});

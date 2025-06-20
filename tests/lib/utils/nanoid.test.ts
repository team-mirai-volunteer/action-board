jest.mock("nanoid", () => ({
  nanoid: jest.fn(() => "test1234"),
}));

import { generateReferralCode } from "../../../lib/utils/nanoid";

describe("nanoid utils", () => {
  it("紹介コード生成の正常処理", () => {
    const code = generateReferralCode();
    expect(typeof code).toBe("string");
    expect(code.length).toBe(8);
  });

  it("紹介コード一意性確認", () => {
    const { nanoid } = require("nanoid");
    (nanoid as jest.Mock).mockReturnValueOnce("test5678");
    const code1 = generateReferralCode();
    const code2 = generateReferralCode();
    expect(code1).not.toBe(code2);
  });
});

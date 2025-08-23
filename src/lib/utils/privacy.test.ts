import { maskUsername } from "./privacy";

describe("maskUsername", () => {
  test("masks username with first letter and x's", () => {
    expect(maskUsername("shota")).toBe("sxxxx");
    expect(maskUsername("john")).toBe("jxxx");
    expect(maskUsername("a")).toBe("a");
    expect(maskUsername("alice")).toBe("axxxx");
  });

  test("handles empty or null values", () => {
    expect(maskUsername("")).toBe("");
    expect(maskUsername(null)).toBe("");
    expect(maskUsername(undefined)).toBe("");
  });

  test("preserves the exact length of the username", () => {
    expect(maskUsername("ab")).toBe("ax");
    expect(maskUsername("abc")).toBe("axx");
    expect(maskUsername("verylongusername")).toBe("vxxxxxxxxxxxxxxx");
  });

  test("handles special characters in first position", () => {
    expect(maskUsername("@user")).toBe("@xxxx");
    expect(maskUsername("123user")).toBe("1xxxxxx");
    expect(maskUsername("日本語")).toBe("日xx");
  });
});

import { calculateAge, cn, encodedRedirect } from "./utils";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

import { redirect } from "next/navigation";

describe("utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("cn", () => {
    it("should combine class names", () => {
      const result = cn("class1", "class2");
      expect(typeof result).toBe("string");
      expect(result).toContain("class1");
      expect(result).toContain("class2");
    });

    it("should handle conditional classes", () => {
      const result = cn("base", true && "conditional", false && "hidden");
      expect(result).toContain("base");
      expect(result).toContain("conditional");
      expect(result).not.toContain("hidden");
    });

    it("should handle empty inputs", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("should return a single class as-is", () => {
      expect(cn("p-4")).toBe("p-4");
    });

    it("should merge conflicting Tailwind classes (last wins)", () => {
      expect(cn("p-2", "p-4")).toBe("p-4");
    });

    it("should merge conflicting Tailwind text size classes", () => {
      expect(cn("text-sm", "text-lg")).toBe("text-lg");
    });

    it("should handle undefined and null values", () => {
      expect(cn("base", undefined, null, "extra")).toBe("base extra");
    });

    it("should handle array inputs", () => {
      expect(cn(["p-2", "m-2"])).toBe("p-2 m-2");
    });
  });

  describe("encodedRedirect", () => {
    it("should call redirect with encoded error message", () => {
      encodedRedirect("error", "/login", "Invalid credentials");
      expect(redirect).toHaveBeenCalledWith(
        "/login?error=Invalid%20credentials",
      );
    });

    it("should call redirect with encoded success message", () => {
      encodedRedirect("success", "/dashboard", "Login successful");
      expect(redirect).toHaveBeenCalledWith(
        "/dashboard?success=Login%20successful",
      );
    });

    it("should handle special characters in message", () => {
      encodedRedirect("error", "/test", "Error: 日本語メッセージ");
      expect(redirect).toHaveBeenCalledWith(
        "/test?error=Error%3A%20%E6%97%A5%E6%9C%AC%E8%AA%9E%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8",
      );
    });
  });

  describe("calculateAge", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-06-15"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should calculate correct age when birthday has passed", () => {
      const age = calculateAge("1990-01-01");
      expect(age).toBe(34);
    });

    it("should calculate correct age when birthday has not passed", () => {
      const age = calculateAge("1990-12-31");
      expect(age).toBe(33);
    });

    it("should calculate correct age when birthday is today", () => {
      const age = calculateAge("1990-06-15");
      expect(age).toBe(34);
    });

    it("should handle same month but day not reached", () => {
      const age = calculateAge("1990-06-20");
      expect(age).toBe(33);
    });

    it("should handle leap year birthdate", () => {
      const age = calculateAge("1992-02-29");
      expect(age).toBe(32);
    });

    it("should return 0 for a baby born this year before today", () => {
      expect(calculateAge("2024-01-01")).toBe(0);
    });

    it("should return 0 for a baby born today", () => {
      expect(calculateAge("2024-06-15")).toBe(0);
    });

    it("should handle leap year birthday before it occurs in non-leap year", () => {
      jest.setSystemTime(new Date("2025-02-28"));
      // Born Feb 29, 2000. Feb 29 doesn't exist in 2025.
      // Month is same (1), but day 28 < 29, so age is decremented
      expect(calculateAge("2000-02-29")).toBe(24);
    });

    it("should handle birthday tomorrow", () => {
      expect(calculateAge("1990-06-16")).toBe(33);
    });
  });
});

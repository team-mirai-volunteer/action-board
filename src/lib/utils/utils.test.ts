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
      expect(typeof result).toBe("string");
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
  });
});

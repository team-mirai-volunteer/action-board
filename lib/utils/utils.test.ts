import {
  calculateAge,
  calculateLevel,
  calculateMissionXp,
  cn,
  encodedRedirect,
  getLevelProgress,
  getXpToNextLevel,
  totalXp,
  xpDelta,
} from "./utils";

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

  describe("xpDelta", () => {
    it("should calculate XP delta correctly for level 1", () => {
      expect(xpDelta(1)).toBe(40);
    });

    it("should calculate XP delta correctly for level 2", () => {
      expect(xpDelta(2)).toBe(55);
    });

    it("should calculate XP delta correctly for level 10", () => {
      expect(xpDelta(10)).toBe(175);
    });

    it("should throw error for level less than 1", () => {
      expect(() => xpDelta(0)).toThrow("Level must be at least 1");
    });

    it("should throw error for negative level", () => {
      expect(() => xpDelta(-1)).toThrow("Level must be at least 1");
    });
  });

  describe("totalXp", () => {
    it("should calculate total XP correctly for level 1", () => {
      expect(totalXp(1)).toBe(0);
    });

    it("should calculate total XP correctly for level 2", () => {
      expect(totalXp(2)).toBe(40);
    });

    it("should calculate total XP correctly for level 3", () => {
      expect(totalXp(3)).toBe(95);
    });

    it("should throw error for level less than 1", () => {
      expect(() => totalXp(0)).toThrow("Level must be at least 1");
    });

    it("should throw error for negative level", () => {
      expect(() => totalXp(-1)).toThrow("Level must be at least 1");
    });
  });

  describe("calculateLevel", () => {
    it("should return level 1 for negative XP", () => {
      expect(calculateLevel(-10)).toBe(1);
    });

    it("should return level 1 for 0 XP", () => {
      expect(calculateLevel(0)).toBe(1);
    });

    it("should return level 1 for small XP amounts", () => {
      expect(calculateLevel(30)).toBe(1);
    });

    it("should return level 2 for XP between level 2 and 3", () => {
      expect(calculateLevel(50)).toBe(2);
    });

    it("should return level 2 for XP at level 2 threshold", () => {
      expect(calculateLevel(40)).toBe(2);
    });

    it("should return maximum level for very high XP", () => {
      expect(calculateLevel(999999999)).toBe(1000);
    });

    it("should handle boundary cases correctly", () => {
      expect(calculateLevel(40)).toBe(2);
      expect(calculateLevel(39)).toBe(1);
    });
  });

  describe("calculateMissionXp", () => {
    it("should return 50 XP for difficulty 1", () => {
      expect(calculateMissionXp(1)).toBe(50);
    });

    it("should return 100 XP for difficulty 2", () => {
      expect(calculateMissionXp(2)).toBe(100);
    });

    it("should return 200 XP for difficulty 3", () => {
      expect(calculateMissionXp(3)).toBe(200);
    });

    it("should return 400 XP for difficulty 4", () => {
      expect(calculateMissionXp(4)).toBe(400);
    });

    it("should return default 50 XP for unknown difficulty", () => {
      expect(calculateMissionXp(5)).toBe(50);
      expect(calculateMissionXp(0)).toBe(50);
      expect(calculateMissionXp(-1)).toBe(50);
      expect(calculateMissionXp(999)).toBe(50);
    });
  });

  describe("getXpToNextLevel", () => {
    it("should return correct XP needed for next level", () => {
      const xpToNext = getXpToNextLevel(0);
      expect(xpToNext).toBe(40);
    });

    it("should return correct XP needed when at level boundary", () => {
      const xpToNext = getXpToNextLevel(40);
      expect(xpToNext).toBe(55);
    });

    it("should return 0 when at maximum level", () => {
      const xpToNext = getXpToNextLevel(999999999);
      expect(xpToNext).toBe(0);
    });

    it("should handle negative XP", () => {
      const xpToNext = getXpToNextLevel(-10);
      expect(xpToNext).toBe(50);
    });

    it("should handle partial progress through level", () => {
      const xpToNext = getXpToNextLevel(50);
      expect(xpToNext).toBeGreaterThan(0);
      expect(xpToNext).toBeLessThan(80);
    });
  });

  describe("getLevelProgress", () => {
    it("should return 0 progress at start of level", () => {
      const progress = getLevelProgress(0);
      expect(progress).toBe(0);
    });

    it("should return progress between 0 and 1", () => {
      const progress = getLevelProgress(20);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    });

    it("should return 1 when at level boundary", () => {
      const progress = getLevelProgress(40);
      expect(progress).toBe(0);
    });

    it("should handle negative XP", () => {
      const progress = getLevelProgress(-10);
      expect(progress).toBe(0);
    });

    it("should handle very high XP", () => {
      const progress = getLevelProgress(999999999);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    });

    it("should return consistent progress values", () => {
      const progress1 = getLevelProgress(20);
      const progress2 = getLevelProgress(30);
      expect(progress1).toBeLessThan(progress2);
      expect(progress1).toBeCloseTo(0.5, 1);
      expect(progress2).toBeCloseTo(0.75, 1);
    });
  });
});

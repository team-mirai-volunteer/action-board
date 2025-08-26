import {
  calculateLevel,
  calculateMissionXp,
  getLevelProgress,
  getXpToNextLevel,
  totalXp,
  xpDelta,
} from "@/features/user-level/utils/level-calculator";
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

  describe("ミッション経験値計算", () => {
    describe("calculateMissionXp", () => {
      it("難易度1（★1 Easy）は50XP", () => {
        expect(calculateMissionXp(1)).toBe(50);
      });

      it("難易度2（★2 Normal）は100XP", () => {
        expect(calculateMissionXp(2)).toBe(100);
      });

      it("難易度3（★3 Hard）は200XP", () => {
        expect(calculateMissionXp(3)).toBe(200);
      });

      it("難易度4（★4 Super hard）は400XP", () => {
        expect(calculateMissionXp(4)).toBe(400);
      });

      it("難易度5（★5）は800XP", () => {
        expect(calculateMissionXp(5)).toBe(800);
      });

      it("無効な難易度（0）はデフォルト50XP", () => {
        expect(calculateMissionXp(0)).toBe(50);
      });

      it("無効な難易度（6）はデフォルト50XP", () => {
        expect(calculateMissionXp(6)).toBe(50);
      });

      it("負の難易度はデフォルト50XP", () => {
        expect(calculateMissionXp(-1)).toBe(50);
      });

      it("should return default 50 XP for unknown difficulty", () => {
        expect(calculateMissionXp(999)).toBe(50);
      });
    });
  });

  describe("XP差分計算", () => {
    describe("xpDelta", () => {
      it("レベル1から2の差分は40XP", () => {
        expect(xpDelta(1)).toBe(40);
      });

      it("レベル2から3の差分は55XP", () => {
        expect(xpDelta(2)).toBe(55);
      });

      it("レベル3から4の差分は70XP", () => {
        expect(xpDelta(3)).toBe(70);
      });

      it("レベル4から5の差分は85XP", () => {
        expect(xpDelta(4)).toBe(85);
      });

      it("レベル10から11の差分は175XP", () => {
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
      it("レベル1までの累計XPは0", () => {
        expect(totalXp(1)).toBe(0);
      });

      it("レベル2までの累計XPは40XP", () => {
        expect(totalXp(2)).toBe(totalXp(1) + 40);
      });

      it("レベル3までの累計XPは95XP", () => {
        expect(totalXp(3)).toBe(totalXp(2) + 55);
      });

      it("レベル4までの累計XPは165XP", () => {
        expect(totalXp(4)).toBe(totalXp(3) + 70);
      });

      it("レベル5までの累計XPは250XP", () => {
        expect(totalXp(5)).toBe(totalXp(4) + 85);
      });

      it("レベル10までの累計XPは900XP", () => {
        expect(totalXp(10)).toBe(totalXp(9) + 160);
      });

      it("should throw error for level less than 1", () => {
        expect(() => totalXp(0)).toThrow("Level must be at least 1");
      });

      it("should throw error for negative level", () => {
        expect(() => totalXp(-1)).toThrow("Level must be at least 1");
      });
    });
  });

  describe("XPからユーザーのレベルを計算", () => {
    it("XPが0の場合はレベル1", () => {
      expect(calculateLevel(0)).toBe(1);
    });

    it("XPが40の場合はレベル2", () => {
      expect(calculateLevel(40)).toBe(2);
    });

    it("XPが94の場合はレベル2", () => {
      expect(calculateLevel(94)).toBe(2);
    });

    it("XPが95の場合はレベル3", () => {
      expect(calculateLevel(95)).toBe(3);
    });

    it("XPが164の場合はレベル3", () => {
      expect(calculateLevel(164)).toBe(3);
    });

    it("XPが165の場合はレベル4", () => {
      expect(calculateLevel(165)).toBe(4);
    });

    it("XPが249の場合はレベル4", () => {
      expect(calculateLevel(249)).toBe(4);
    });

    it("XPが250の場合はレベル5", () => {
      expect(calculateLevel(250)).toBe(5);
    });

    it("XPが350の場合はレベル6", () => {
      expect(calculateLevel(350)).toBe(6);
    });

    it("XPが3325の場合はレベル20", () => {
      expect(calculateLevel(3325)).toBe(20);
    });

    it("XPが19600の場合はレベル50", () => {
      expect(calculateLevel(19600)).toBe(50);
    });

    it("XPが76725の場合はレベル100", () => {
      expect(calculateLevel(76725)).toBe(100);
    });

    it("XPがマイナスの場合はレベル1", () => {
      expect(calculateLevel(-100)).toBe(1);
    });

    it("should return level 1 for small XP amounts", () => {
      expect(calculateLevel(30)).toBe(1);
    });

    it("should return level 2 for XP between level 2 and 3", () => {
      expect(calculateLevel(50)).toBe(2);
    });

    it("should return maximum level for very high XP", () => {
      expect(calculateLevel(999999999)).toBe(1000);
    });

    it("should handle boundary cases correctly", () => {
      expect(calculateLevel(40)).toBe(2);
      expect(calculateLevel(39)).toBe(1);
    });

    it("XPがレベルLの必要XPより1少ない場合はレベルL-1", () => {
      for (let L = 2; L <= 10; L++) {
        expect(calculateLevel(totalXp(L) - 1)).toBe(L - 1);
      }
    });

    it("XPがレベルLの必要XPと同じ場合はレベルL", () => {
      for (let L = 1; L <= 10; L++) {
        expect(calculateLevel(totalXp(L))).toBe(L);
      }
    });

    it("XPが最大レベル1000の必要XPを超える場合はレベル1000", () => {
      expect(calculateLevel(totalXp(1001))).toBe(1000);
    });
  });

  describe("次のレベルまでのXP計算", () => {
    it("XPが0の場合、次のレベルまでのXPは40", () => {
      expect(getXpToNextLevel(0)).toBe(40);
    });

    it("XPが40の場合、次のレベルまでのXPは55", () => {
      expect(getXpToNextLevel(40)).toBe(55);
    });

    it("XPが100の場合、次のレベルまでのXPは65", () => {
      expect(getXpToNextLevel(100)).toBe(65);
    });

    it("XPが750の場合、次のレベルまでのXPは150", () => {
      expect(getXpToNextLevel(750)).toBe(150);
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

  describe("レベル進捗率計算", () => {
    it("レベル1のXPが0の場合は進捗率0", () => {
      expect(getLevelProgress(0)).toBe(0);
    });

    it("レベル1のXPが20の場合は進捗率0.5", () => {
      expect(getLevelProgress(20)).toBe(0.5);
    });

    it("レベル1のXPが39の場合は進捗率ほぼ1", () => {
      expect(getLevelProgress(39)).toBe(39 / 40);
    });

    it("レベル2のXPが40の場合は進捗率0", () => {
      expect(getLevelProgress(40)).toBe(0);
    });

    it("レベル2のXPが94の場合は進捗率ほぼ1", () => {
      expect(getLevelProgress(94)).toBeGreaterThan(0.9);
    });

    it("レベル3のXPが95の場合は進捗率0", () => {
      expect(getLevelProgress(95)).toBe(0);
    });

    it("レベル5のXPが300の場合は進捗率0.5", () => {
      expect(getLevelProgress(300)).toBe(0.5);
    });

    it("レベル10のXPが900の場合は進捗率0", () => {
      expect(getLevelProgress(900)).toBe(0);
    });

    it("レベル20のXPが3325の場合は進捗率0", () => {
      expect(getLevelProgress(3325)).toBe(0);
    });

    it("レベル50のXPが19600の場合は進捗率0", () => {
      expect(getLevelProgress(19600)).toBe(0);
    });

    it("レベル100のXPが76725の場合は進捗率0", () => {
      expect(getLevelProgress(76725)).toBe(0);
    });

    it("should return progress between 0 and 1", () => {
      const progress = getLevelProgress(20);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
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

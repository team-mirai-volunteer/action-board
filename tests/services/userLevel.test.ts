import {
  calculateLevel,
  calculateMissionXp,
  totalXp,
  xpDelta,
} from "@/lib/utils/utils";

describe("userLevel service", () => {
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

      it("無効な難易度（0）はデフォルト50XP", () => {
        expect(calculateMissionXp(0)).toBe(50);
      });

      it("難易度4（Super hard）は400XP", () => {
        expect(calculateMissionXp(4)).toBe(400);
      });

      it("負の難易度はデフォルト50XP", () => {
        expect(calculateMissionXp(-1)).toBe(50);
      });
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

    it("レベル10から11の差分は160XP", () => {
      expect(xpDelta(10)).toBe(175);
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

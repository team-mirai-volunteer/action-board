import {
  calculateLevel,
  calculateMissionXp,
  getLevelProgress,
  getXpToNextLevel,
  totalXp,
  xpDelta,
} from "./level-calculator";

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

    it("未知の難易度ではデフォルトの50XPを返す", () => {
      expect(calculateMissionXp(999)).toBe(50);
    });

    describe("注目ミッション（2倍ボーナス）", () => {
      it("難易度1の注目ミッションは100XP", () => {
        expect(calculateMissionXp(1, true)).toBe(100);
      });

      it("難易度2の注目ミッションは200XP", () => {
        expect(calculateMissionXp(2, true)).toBe(200);
      });

      it("難易度3の注目ミッションは400XP", () => {
        expect(calculateMissionXp(3, true)).toBe(400);
      });

      it("難易度4の注目ミッションは800XP", () => {
        expect(calculateMissionXp(4, true)).toBe(800);
      });

      it("難易度5の注目ミッションは1600XP", () => {
        expect(calculateMissionXp(5, true)).toBe(1600);
      });

      it("無効な難易度の注目ミッションはデフォルト50XPの2倍で100XP", () => {
        expect(calculateMissionXp(0, true)).toBe(100);
      });

      it("isFeaturedがfalseの場合は通常のXP", () => {
        expect(calculateMissionXp(3, false)).toBe(200);
      });

      it("isFeaturedが省略された場合は通常のXP", () => {
        expect(calculateMissionXp(3)).toBe(200);
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

    it("レベル10から11の差分は175XP", () => {
      expect(xpDelta(10)).toBe(175);
    });

    it("レベルが1未満の場合はエラーを投げる", () => {
      expect(() => xpDelta(0)).toThrow("Level must be at least 1");
    });

    it("負のレベルの場合はエラーを投げる", () => {
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

    it("レベルが1未満の場合はエラーを投げる", () => {
      expect(() => totalXp(0)).toThrow("Level must be at least 1");
    });

    it("負のレベルの場合はエラーを投げる", () => {
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

  it("少量のXPではレベル1を返す", () => {
    expect(calculateLevel(30)).toBe(1);
  });

  it("レベル2と3の間のXPではレベル2を返す", () => {
    expect(calculateLevel(50)).toBe(2);
  });

  it("非常に大きなXPでは最大レベルを返す", () => {
    expect(calculateLevel(999999999)).toBe(1000);
  });

  it("境界値を正しく処理する", () => {
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

  it("最大レベルに達している場合は0を返す", () => {
    const xpToNext = getXpToNextLevel(999999999);
    expect(xpToNext).toBe(0);
  });

  it("負のXPでも処理できる", () => {
    const xpToNext = getXpToNextLevel(-10);
    expect(xpToNext).toBe(50);
  });

  it("レベル途中の部分的な進捗も処理できる", () => {
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

  it("進捗率は0から1の範囲で返す", () => {
    const progress = getLevelProgress(20);
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(1);
  });

  it("負のXPでも処理できる", () => {
    const progress = getLevelProgress(-10);
    expect(progress).toBe(0);
  });

  it("非常に大きなXPでも処理できる", () => {
    const progress = getLevelProgress(999999999);
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(1);
  });

  it("進捗率を一貫した値で返す", () => {
    const progress1 = getLevelProgress(20);
    const progress2 = getLevelProgress(30);
    expect(progress1).toBeLessThan(progress2);
    expect(progress1).toBeCloseTo(0.5, 1);
    expect(progress2).toBeCloseTo(0.75, 1);
  });
});

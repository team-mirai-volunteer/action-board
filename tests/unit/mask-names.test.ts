import { describe, test, expect } from "@jest/globals";
import { 
  isDesignatedCity, 
  extractWardFromAddress 
} from "../../poster_data/designated-cities";

describe("designated-cities", () => {
  describe("isDesignatedCity", () => {
    test("政令指定都市を正しく識別する", () => {
      expect(isDesignatedCity("千葉県", "千葉市")).toBe(true);
      expect(isDesignatedCity("神奈川県", "横浜市")).toBe(true);
      expect(isDesignatedCity("大阪府", "大阪市")).toBe(true);
      expect(isDesignatedCity("福岡県", "福岡市")).toBe(true);
    });

    test("政令指定都市でない都市は false を返す", () => {
      expect(isDesignatedCity("福岡県", "宗像市")).toBe(false);
      expect(isDesignatedCity("東京都", "渋谷区")).toBe(false);
      expect(isDesignatedCity("沖縄県", "那覇市")).toBe(false);
    });
  });

  describe("extractWardFromAddress", () => {
    test("政令指定都市の区を正しく抽出する", () => {
      // 区名で始まる場合
      expect(extractWardFromAddress("千葉県", "千葉市", "美浜区美浜1-2-3田中宅"))
        .toBe("美浜区");
      
      // 市名+区名で始まる場合
      expect(extractWardFromAddress("神奈川県", "横浜市", "横浜市青葉区青葉台1-2-3"))
        .toBe("青葉区");
      
      // 正規表現パターン（^[^区]*区名）にマッチする場合
      expect(extractWardFromAddress("大阪府", "大阪市", "大阪中央区本町1-2-3"))
        .toBe("中央区");
    });

    test("個人名が含まれていても正しく区を抽出する", () => {
      expect(extractWardFromAddress("神奈川県", "川崎市", "川崎区日進町1-2-3田中様"))
        .toBe("川崎区");
      
      expect(extractWardFromAddress("福岡県", "福岡市", "博多区博多駅前1-2-3佐藤宅"))
        .toBe("博多区");
    });

    test("政令指定都市でない場合は元の住所を返す", () => {
      const address = "吉留46-9田中宅";
      expect(extractWardFromAddress("福岡県", "宗像市", address))
        .toBe(address);
    });

    test("区が特定できない場合は masked を返す", () => {
      expect(extractWardFromAddress("千葉県", "千葉市", "不明な住所1-2-3"))
        .toBe("masked");
      
      expect(extractWardFromAddress("神奈川県", "横浜市", "住所不明"))
        .toBe("masked");
    });
  });
});

// mask-names.ts の関数をテストするために、重要な関数を模擬
describe("mask-names logic", () => {
  // hasPersonalName 関数のテスト
  function hasPersonalName(str: string): boolean {
    if (str.includes("様")) return true;
    if (str.includes("宅") && !str.includes("住宅")) return true;
    return false;
  }

  // removePersonalNameFromAddress 関数のテスト
  function removePersonalNameFromAddress(address: string): string {
    if (!hasPersonalName(address)) {
      return address;
    }
    
    const personalNamePattern = /[一-龯ぁ-んァ-ヶｱ-ﾝﾞﾟA-Za-z\s・]+(様|宅).*$/;
    
    let cleanedAddress = address;
    cleanedAddress = cleanedAddress.replace(personalNamePattern, "").trim();
    
    if (address.includes("住宅") && cleanedAddress.length < address.length * 0.5) {
      return address;
    }
    
    if (cleanedAddress.length < address.length * 0.3) {
      return "masked";
    }
    
    return cleanedAddress;
  }

  describe("hasPersonalName", () => {
    test("個人名を含む住所を正しく識別する", () => {
      expect(hasPersonalName("美浜区美浜1-2-3田中宅")).toBe(true);
      expect(hasPersonalName("青葉区青葉台1-2-3佐藤様")).toBe(true);
      expect(hasPersonalName("中央区本町1-2-3山田宅")).toBe(true);
    });

    test("個人名を含まない住所は false を返す", () => {
      expect(hasPersonalName("美浜区美浜1-2-3")).toBe(false);
      expect(hasPersonalName("青葉区青葉台1-2-3")).toBe(false);
      expect(hasPersonalName("吉留46-9グローバルアリーナ入口")).toBe(false);
    });

    test("住宅は個人名として扱わない", () => {
      expect(hasPersonalName("美浜区美浜1-2-3県営住宅")).toBe(false);
      expect(hasPersonalName("青葉区青葉台1-2-3市営住宅")).toBe(false);
    });
  });

  describe("removePersonalNameFromAddress", () => {
    test("個人名部分のみを除去する", () => {
      expect(removePersonalNameFromAddress("美浜区美浜1-2-3田中宅"))
        .toBe("美浜区美浜1-2-3");
      
      expect(removePersonalNameFromAddress("青葉区青葉台1-2-3佐藤様"))
        .toBe("青葉区青葉台1-2-3");
      
      expect(removePersonalNameFromAddress("港区港南2-16-1田中様の自宅"))
        .toBe("港区港南2-16-1");
    });

    test("個人名がない場合は変更しない", () => {
      const address = "美浜区美浜1-2-3";
      expect(removePersonalNameFromAddress(address)).toBe(address);
    });

    test("住宅は除去対象外", () => {
      const address = "美浜区美浜1-2-3県営住宅";
      expect(removePersonalNameFromAddress(address)).toBe(address);
    });

    test("住所部分が短すぎる場合は masked を返す", () => {
      expect(removePersonalNameFromAddress("田中宅")).toBe("masked");
    });
  });

  describe("マスキング統合ロジック", () => {
    // 実際のマスキングロジックのテスト
    function processAddress(
      address: string, 
      prefecture: string, 
      city: string
    ): string {
      if (!hasPersonalName(address)) {
        return address; // 個人名がない場合は変更なし
      }

      if (prefecture && city) {
        const wardExtracted = extractWardFromAddress(prefecture, city, address);
        
        if (wardExtracted !== address && wardExtracted !== "masked") {
          return wardExtracted; // 政令指定都市の区を抽出
        } else {
          return removePersonalNameFromAddress(address); // 個人名のみ除去
        }
      } else {
        return removePersonalNameFromAddress(address); // 個人名のみ除去
      }
    }

    test("政令指定都市で個人名がある場合：区のみ抽出", () => {
      expect(processAddress("美浜区美浜1-2-3田中宅", "千葉県", "千葉市"))
        .toBe("美浜区");
      
      expect(processAddress("青葉区青葉台1-2-3佐藤様", "神奈川県", "横浜市"))
        .toBe("青葉区");
    });

    test("政令指定都市で個人名がない場合：変更なし", () => {
      expect(processAddress("美浜区美浜1-2-3", "千葉県", "千葉市"))
        .toBe("美浜区美浜1-2-3");
      
      expect(processAddress("青葉区青葉台1-2-3", "神奈川県", "横浜市"))
        .toBe("青葉区青葉台1-2-3");
    });

    test("非政令指定都市で個人名がある場合：個人名のみ除去", () => {
      expect(processAddress("吉留46-9田中宅", "福岡県", "宗像市"))
        .toBe("吉留46-9");
      
      expect(processAddress("本町1-2-3佐藤様", "東京都", "渋谷区"))
        .toBe("本町1-2-3");
    });

    test("非政令指定都市で個人名がない場合：変更なし", () => {
      expect(processAddress("吉留46-9グローバルアリーナ入口", "福岡県", "宗像市"))
        .toBe("吉留46-9グローバルアリーナ入口");
    });
  });
});
import { getPartyPlanConfig, PARTY_PLAN_CONFIG } from "./plans";

describe("getPartyPlanConfig", () => {
  describe("valid plan names", () => {
    test("returns starter plan config", () => {
      const config = getPartyPlanConfig("starter");
      expect(config).toEqual({
        label: "スタータープラン",
        imageSrc: "/img/party-member-badge/starter.svg",
      });
    });

    test("returns regular plan config", () => {
      const config = getPartyPlanConfig("regular");
      expect(config).toEqual({
        label: "レギュラープラン",
        imageSrc: "/img/party-member-badge/regular.svg",
      });
    });

    test("returns premium plan config", () => {
      const config = getPartyPlanConfig("premium");
      expect(config).toEqual({
        label: "プレミアムプラン",
        imageSrc: "/img/party-member-badge/premium.svg",
      });
    });
  });

  describe("invalid plan names", () => {
    test("returns undefined for unknown plan", () => {
      const config = getPartyPlanConfig("unknown" as any);
      expect(config).toBeUndefined();
    });

    test("returns undefined for empty string", () => {
      const config = getPartyPlanConfig("" as any);
      expect(config).toBeUndefined();
    });
  });

  describe("PARTY_PLAN_CONFIG", () => {
    test("has exactly 3 plans", () => {
      expect(Object.keys(PARTY_PLAN_CONFIG)).toHaveLength(3);
    });

    test("all plans have label and imageSrc", () => {
      for (const [, config] of Object.entries(PARTY_PLAN_CONFIG)) {
        expect(config).toHaveProperty("label");
        expect(config).toHaveProperty("imageSrc");
        expect(typeof config.label).toBe("string");
        expect(typeof config.imageSrc).toBe("string");
      }
    });
  });
});

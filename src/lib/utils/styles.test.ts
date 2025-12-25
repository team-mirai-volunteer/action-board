import { cn } from "./styles";

describe("styles", () => {
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

    it("should handle null and undefined values", () => {
      const result = cn("base", null, undefined, "valid");
      expect(result).toContain("base");
      expect(result).toContain("valid");
    });

    it("should handle array inputs", () => {
      const result = cn(["class1", "class2"], "class3");
      expect(result).toContain("class1");
      expect(result).toContain("class2");
      expect(result).toContain("class3");
    });

    it("should handle object inputs", () => {
      const result = cn({ active: true, disabled: false }, "base");
      expect(result).toContain("active");
      expect(result).not.toContain("disabled");
      expect(result).toContain("base");
    });

    it("should merge conflicting tailwind classes", () => {
      const result = cn("p-4", "p-2");
      expect(typeof result).toBe("string");
    });
  });
});

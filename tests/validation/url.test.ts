import { validateReturnUrl } from "@/lib/validation/url";

describe("validateReturnUrl", () => {
  describe("valid URLs", () => {
    it("should accept relative URLs", () => {
      expect(validateReturnUrl("/")).toBe("/");
      expect(validateReturnUrl("/home")).toBe("/home");
      expect(validateReturnUrl("/missions/123")).toBe("/missions/123");
      expect(validateReturnUrl("/settings/profile?new=true")).toBe("/settings/profile?new=true");
    });

    it("should handle null and undefined", () => {
      expect(validateReturnUrl(null)).toBe(null);
      expect(validateReturnUrl(undefined)).toBe(null);
      expect(validateReturnUrl("")).toBe(null);
    });
  });

  describe("invalid URLs", () => {
    it("should reject protocol-relative URLs", () => {
      expect(validateReturnUrl("//evil.com")).toBe(null);
      expect(validateReturnUrl("//evil.com/path")).toBe(null);
    });

    it("should reject javascript: protocol", () => {
      expect(validateReturnUrl("javascript:alert(1)")).toBe(null);
      expect(validateReturnUrl("javascript:void(0)")).toBe(null);
    });

    it("should reject data: protocol", () => {
      expect(validateReturnUrl("data:text/html,<script>alert(1)</script>")).toBe(null);
    });

    it("should reject other dangerous protocols", () => {
      expect(validateReturnUrl("vbscript:alert(1)")).toBe(null);
      expect(validateReturnUrl("file:///etc/passwd")).toBe(null);
    });

    it("should reject URLs with backslashes", () => {
      expect(validateReturnUrl("\\\\evil.com")).toBe(null);
      expect(validateReturnUrl("/\\evil.com")).toBe(null);
    });

    it("should reject URLs with null bytes", () => {
      expect(validateReturnUrl("/home%00.evil.com")).toBe(null);
    });

    it("should reject URLs with newlines", () => {
      expect(validateReturnUrl("/home\\nevil.com")).toBe(null);
      expect(validateReturnUrl("/home\\revil.com")).toBe(null);
    });

    it("should reject absolute URLs", () => {
      expect(validateReturnUrl("https://evil.com")).toBe(null);
      expect(validateReturnUrl("http://malicious.site/steal")).toBe(null);
      expect(validateReturnUrl("https://example.com")).toBe(null);
      expect(validateReturnUrl("http://localhost:3000/")).toBe(null);
      expect(validateReturnUrl("https://localhost:3000/home")).toBe(null);
    });

    it("should reject any URL with colon (protocol indicator)", () => {
      expect(validateReturnUrl("http://invalid")).toBe(null);
      expect(validateReturnUrl("custom:scheme")).toBe(null);
      expect(validateReturnUrl("not:a:url")).toBe(null);
    });

    it("should trim whitespace and still validate", () => {
      expect(validateReturnUrl("  /home  ")).toBe("/home");
      expect(validateReturnUrl("  //evil.com  ")).toBe(null);
    });

    it("should reject bypass attempts", () => {
      expect(validateReturnUrl("http://evil.com#@localhost:3000")).toBe(null);
      expect(validateReturnUrl("http://localhost:3000@evil.com")).toBe(null);
      expect(validateReturnUrl("http://evil.com?redirect=localhost:3000")).toBe(null);
      expect(validateReturnUrl("home")).toBe(null); // Not starting with /
      expect(validateReturnUrl("./home")).toBe(null); // Relative but not starting with /
      expect(validateReturnUrl("../home")).toBe(null); // Relative but not starting with /
    });
  });
});
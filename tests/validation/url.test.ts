import { validateReturnUrl } from "@/lib/validation/url";

describe("validateReturnUrl", () => {
  describe("valid URLs", () => {
    it("should accept relative URLs", () => {
      expect(validateReturnUrl("/")).toBe("/");
      expect(validateReturnUrl("/home")).toBe("/home");
      expect(validateReturnUrl("/missions/123")).toBe("/missions/123");
      expect(validateReturnUrl("/settings/profile?new=true")).toBe("/settings/profile?new=true");
    });

    it("should accept same-origin absolute URLs in development", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      expect(validateReturnUrl("http://localhost:3000/")).toBe("http://localhost:3000/");
      expect(validateReturnUrl("https://localhost:3000/home")).toBe("https://localhost:3000/home");
      expect(validateReturnUrl("http://127.0.0.1:3000/")).toBe("http://127.0.0.1:3000/");
      
      process.env.NODE_ENV = originalEnv;
    });

    it("should accept configured app URL", () => {
      const originalUrl = process.env.NEXT_PUBLIC_APP_URL;
      process.env.NEXT_PUBLIC_APP_URL = "https://example.com";

      expect(validateReturnUrl("https://example.com/")).toBe("https://example.com/");
      expect(validateReturnUrl("https://example.com/missions")).toBe("https://example.com/missions");

      process.env.NEXT_PUBLIC_APP_URL = originalUrl;
    });

    it("should accept allowed external hosts", () => {
      const allowedHosts = ["trusted.com", "api.example.com"];
      expect(validateReturnUrl("https://trusted.com/callback", allowedHosts)).toBe("https://trusted.com/callback");
      expect(validateReturnUrl("https://api.example.com/auth", allowedHosts)).toBe("https://api.example.com/auth");
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

    it("should reject external domains not in allowlist", () => {
      expect(validateReturnUrl("https://evil.com")).toBe(null);
      expect(validateReturnUrl("http://malicious.site/steal")).toBe(null);
      expect(validateReturnUrl("https://example.com.evil.com")).toBe(null);
    });

    it("should reject malformed URLs", () => {
      expect(validateReturnUrl("ht!tp://invalid")).toBe(null);
      expect(validateReturnUrl("not-a-url")).toBe(null);
    });

    it("should trim whitespace and still validate", () => {
      expect(validateReturnUrl("  /home  ")).toBe("/home");
      expect(validateReturnUrl("  //evil.com  ")).toBe(null);
    });

    it("should reject bypass attempts", () => {
      expect(validateReturnUrl("http://evil.com#@localhost:3000")).toBe(null);
      expect(validateReturnUrl("http://localhost:3000@evil.com")).toBe(null);
      expect(validateReturnUrl("http://evil.com?redirect=localhost:3000")).toBe(null);
    });
  });
});
import { parseIdToken, YouTubeAPIError } from "./youtube-client";

describe("parseIdToken", () => {
  // Helper to create a valid JWT-like token
  function makeToken(payload: Record<string, unknown>): string {
    const header = Buffer.from(JSON.stringify({ alg: "RS256" })).toString(
      "base64url",
    );
    const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = "fake-signature";
    return `${header}.${body}.${signature}`;
  }

  it("should parse a valid id_token with all fields", () => {
    const payload = {
      iss: "https://accounts.google.com",
      sub: "1234567890",
      aud: "client-id.apps.googleusercontent.com",
      exp: 1700000000,
      iat: 1699999000,
      email: "user@example.com",
      email_verified: true,
      name: "Test User",
      picture: "https://example.com/photo.jpg",
    };

    const token = makeToken(payload);
    const result = parseIdToken(token);

    expect(result.sub).toBe("1234567890");
    expect(result.iss).toBe("https://accounts.google.com");
    expect(result.email).toBe("user@example.com");
    expect(result.name).toBe("Test User");
  });

  it("should parse a minimal valid id_token with only sub", () => {
    const payload = {
      iss: "https://accounts.google.com",
      sub: "minimal-sub",
      aud: "client-id",
      exp: 1700000000,
      iat: 1699999000,
    };

    const token = makeToken(payload);
    const result = parseIdToken(token);

    expect(result.sub).toBe("minimal-sub");
    expect(result.email).toBeUndefined();
  });

  it("should throw YouTubeAPIError for token with fewer than 3 parts", () => {
    expect(() => parseIdToken("only-one-part")).toThrow(YouTubeAPIError);
    expect(() => parseIdToken("only-one-part")).toThrow(
      "Invalid id_token format",
    );
  });

  it("should throw YouTubeAPIError for token with more than 3 parts", () => {
    expect(() => parseIdToken("a.b.c.d")).toThrow(YouTubeAPIError);
    expect(() => parseIdToken("a.b.c.d")).toThrow("Invalid id_token format");
  });

  it("should throw YouTubeAPIError when sub claim is missing", () => {
    const payload = {
      iss: "https://accounts.google.com",
      aud: "client-id",
      exp: 1700000000,
      iat: 1699999000,
    };

    const token = makeToken(payload);
    expect(() => parseIdToken(token)).toThrow(YouTubeAPIError);
    expect(() => parseIdToken(token)).toThrow(
      "id_token does not contain sub claim",
    );
  });

  it("should throw YouTubeAPIError for invalid base64 payload", () => {
    // Create a token where the payload is not valid JSON
    const header = Buffer.from(JSON.stringify({ alg: "RS256" })).toString(
      "base64url",
    );
    const invalidPayload = Buffer.from("not-json{{{").toString("base64url");
    const token = `${header}.${invalidPayload}.signature`;

    expect(() => parseIdToken(token)).toThrow(YouTubeAPIError);
    expect(() => parseIdToken(token)).toThrow("Failed to parse id_token");
  });
});

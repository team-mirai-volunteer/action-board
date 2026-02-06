import { isTokenExpired } from "./google-auth";

describe("isTokenExpired", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return true when the token has expired (past date)", () => {
    jest.setSystemTime(new Date("2025-01-15T12:00:00Z"));
    expect(isTokenExpired("2025-01-14T12:00:00Z")).toBe(true);
  });

  it("should return false when the token is still valid (future date)", () => {
    jest.setSystemTime(new Date("2025-01-15T12:00:00Z"));
    expect(isTokenExpired("2025-01-16T12:00:00Z")).toBe(false);
  });

  it("should return false when the token expires at exactly the current time", () => {
    // new Date(tokenExpiresAt) < new Date() => equal is NOT less-than => false
    jest.setSystemTime(new Date("2025-01-15T12:00:00.000Z"));
    expect(isTokenExpired("2025-01-15T12:00:00.000Z")).toBe(false);
  });

  it("should return true when the token expired one second ago", () => {
    jest.setSystemTime(new Date("2025-01-15T12:00:01.000Z"));
    expect(isTokenExpired("2025-01-15T12:00:00.000Z")).toBe(true);
  });

  it("should return false when the token expires one second from now", () => {
    jest.setSystemTime(new Date("2025-01-15T11:59:59.000Z"));
    expect(isTokenExpired("2025-01-15T12:00:00.000Z")).toBe(false);
  });
});

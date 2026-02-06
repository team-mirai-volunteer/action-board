jest.mock("nanoid", () => ({
  nanoid: () => "mock-id",
}));
jest.mock("@/lib/supabase/client");

import { isUUID } from "./mission-detail";

describe("isUUID", () => {
  describe("valid UUIDs", () => {
    test("standard UUIDv4 lowercase", () => {
      expect(isUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    });

    test("standard UUIDv4 uppercase", () => {
      expect(isUUID("550E8400-E29B-41D4-A716-446655440000")).toBe(true);
    });

    test("UUIDv4 mixed case", () => {
      expect(isUUID("550e8400-E29B-41d4-A716-446655440000")).toBe(true);
    });

    test("UUIDv1", () => {
      expect(isUUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")).toBe(true);
    });

    test("UUIDv3", () => {
      expect(isUUID("a3bb189e-8bf9-3888-9912-ace4e6543002")).toBe(true);
    });

    test("UUIDv5", () => {
      expect(isUUID("886313e1-3b8a-5372-9b90-0c9aee199e5d")).toBe(true);
    });
  });

  describe("invalid UUIDs", () => {
    test("empty string", () => {
      expect(isUUID("")).toBe(false);
    });

    test("random string", () => {
      expect(isUUID("not-a-uuid")).toBe(false);
    });

    test("too short", () => {
      expect(isUUID("550e8400-e29b-41d4-a716")).toBe(false);
    });

    test("too long", () => {
      expect(isUUID("550e8400-e29b-41d4-a716-446655440000-extra")).toBe(false);
    });

    test("invalid characters (g)", () => {
      expect(isUUID("550e8400-e29b-41d4-a716-44665544000g")).toBe(false);
    });

    test("missing hyphens", () => {
      expect(isUUID("550e8400e29b41d4a716446655440000")).toBe(false);
    });

    test("invalid version digit (0)", () => {
      expect(isUUID("550e8400-e29b-01d4-a716-446655440000")).toBe(false);
    });

    test("invalid version digit (6)", () => {
      expect(isUUID("550e8400-e29b-61d4-a716-446655440000")).toBe(false);
    });

    test("invalid variant (0 in variant position)", () => {
      expect(isUUID("550e8400-e29b-41d4-0716-446655440000")).toBe(false);
    });

    test("slug-like string", () => {
      expect(isUUID("my-mission-slug")).toBe(false);
    });
  });
});

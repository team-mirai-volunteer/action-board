import type { MapShape } from "../types/posting-types";
import { isOwnerOfShape, shouldShowShape } from "./posting-filter-helpers";

const createShape = (userId?: string): MapShape => ({
  type: "polygon",
  coordinates: { type: "Polygon", coordinates: [] },
  user_id: userId,
});

describe("isOwnerOfShape", () => {
  it("returns false for undefined shape", () => {
    expect(isOwnerOfShape(undefined, "user-1")).toBe(false);
  });

  it("returns true when shape user_id matches userId", () => {
    const shape = createShape("user-1");
    expect(isOwnerOfShape(shape, "user-1")).toBe(true);
  });

  it("returns false when shape user_id does not match userId", () => {
    const shape = createShape("user-2");
    expect(isOwnerOfShape(shape, "user-1")).toBe(false);
  });

  it("returns false when shape has no user_id", () => {
    const shape = createShape(undefined);
    expect(isOwnerOfShape(shape, "user-1")).toBe(false);
  });
});

describe("shouldShowShape", () => {
  it("returns true for any shape when showOnlyMine is false", () => {
    const shape = createShape("user-2");
    expect(shouldShowShape(shape, "user-1", false)).toBe(true);
  });

  it("returns true for undefined shape when showOnlyMine is false", () => {
    expect(shouldShowShape(undefined, "user-1", false)).toBe(true);
  });

  it("returns true for owned shape when showOnlyMine is true", () => {
    const shape = createShape("user-1");
    expect(shouldShowShape(shape, "user-1", true)).toBe(true);
  });

  it("returns false for non-owned shape when showOnlyMine is true", () => {
    const shape = createShape("user-2");
    expect(shouldShowShape(shape, "user-1", true)).toBe(false);
  });

  it("returns false for undefined shape when showOnlyMine is true", () => {
    expect(shouldShowShape(undefined, "user-1", true)).toBe(false);
  });

  it("returns false for shape without user_id when showOnlyMine is true", () => {
    const shape = createShape(undefined);
    expect(shouldShowShape(shape, "user-1", true)).toBe(false);
  });
});

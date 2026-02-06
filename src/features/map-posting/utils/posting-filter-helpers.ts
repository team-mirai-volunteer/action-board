import type { MapShape } from "../types/posting-types";

/**
 * Checks whether a shape belongs to the specified user.
 */
export function isOwnerOfShape(
  shape: MapShape | undefined,
  userId: string,
): boolean {
  if (!shape) return false;
  return shape.user_id === userId;
}

/**
 * Determines whether a shape should be displayed based on the filter setting.
 * When showOnlyMine is false, all shapes are shown.
 * When showOnlyMine is true, only shapes owned by the user are shown.
 */
export function shouldShowShape(
  shape: MapShape | undefined,
  userId: string,
  showOnlyMine: boolean,
): boolean {
  if (!showOnlyMine) return true;
  return isOwnerOfShape(shape, userId);
}

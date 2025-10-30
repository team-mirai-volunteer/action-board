import type { PartyMembership } from "./types";

export function isPartyBadgeVisible(
  membership?: PartyMembership | null,
): boolean {
  if (!membership) {
    return false;
  }

  return membership.badge_visibility ?? true;
}

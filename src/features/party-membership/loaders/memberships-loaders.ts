import "server-only";

import {
  getPartyMembershipMap as getPartyMembershipMapService,
  getPartyMembership as getPartyMembershipService,
} from "../services/memberships";

export async function getPartyMembership(userId: string) {
  return getPartyMembershipService(userId);
}

export async function getPartyMembershipMap(userIds: string[]) {
  return getPartyMembershipMapService(userIds);
}

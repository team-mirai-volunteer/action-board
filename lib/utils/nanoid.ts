import { nanoid } from "nanoid";

export function generateReferralCode(): string {
  return nanoid(8);
}

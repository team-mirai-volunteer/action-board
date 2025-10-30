import type { PartyPlan } from "../types";

type PlanConfig = {
  label: string;
  imageSrc: string;
};

export const PARTY_MEMBERSHIP_CTA_URL =
  "https://team-mir.ai/support/membership";

export const PARTY_PLAN_CONFIG: Record<PartyPlan, PlanConfig> = {
  starter: {
    label: "スタータープラン",
    imageSrc: "/img/party-member-badge/starter.svg",
  },
  basic: {
    label: "レギュラープラン",
    imageSrc: "/img/party-member-badge/basic.svg",
  },
  premium: {
    label: "プレミアムプラン",
    imageSrc: "/img/party-member-badge/premium.svg",
  },
} as const;

export function getPartyPlanConfig(plan: PartyPlan): PlanConfig {
  return PARTY_PLAN_CONFIG[plan];
}

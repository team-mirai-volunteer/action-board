import { ClaudeFacilitatorModel } from "./claude";
import { MockFacilitatorModel } from "./mock";
import type { FacilitatorModel } from "./types";

export interface ModelEnv {
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_AUTH_TOKEN?: string;
  FACILITATOR_MODEL?: string;
  FACILITATOR_EFFORT?: string;
  FACILITATOR_USE_MOCK?: string;
}

/**
 * 環境変数からモデルを選ぶ。
 * - FACILITATOR_USE_MOCK=1 → モック
 * - API キーもトークンもない → モック（警告つき）
 * - それ以外 → Claude
 */
export function createModelFromEnv(
  env: ModelEnv = process.env as ModelEnv,
): FacilitatorModel {
  if (env.FACILITATOR_USE_MOCK === "1") {
    return new MockFacilitatorModel();
  }
  if (!env.ANTHROPIC_API_KEY && !env.ANTHROPIC_AUTH_TOKEN) {
    console.warn(
      "[meet-facilitator] ANTHROPIC_API_KEY が未設定のため、モックのファシリテーターを使います",
    );
    return new MockFacilitatorModel();
  }
  const effort = env.FACILITATOR_EFFORT;
  return new ClaudeFacilitatorModel({
    model: env.FACILITATOR_MODEL,
    effort: isEffort(effort) ? effort : undefined,
  });
}

function isEffort(
  value: string | undefined,
): value is "low" | "medium" | "high" | "xhigh" | "max" {
  return (
    value === "low" ||
    value === "medium" ||
    value === "high" ||
    value === "xhigh" ||
    value === "max"
  );
}

export { ClaudeFacilitatorModel, MockFacilitatorModel };
export type { FacilitatorModel };

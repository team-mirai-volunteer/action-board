import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { FacilitationOutput } from "../core/types";
import {
  buildFacilitationUserMessage,
  buildInterviewUserMessage,
  FACILITATOR_SYSTEM_PROMPT,
  INTERVIEW_SYSTEM_PROMPT,
} from "./prompts";
import { facilitationOutputSchema, interviewOutputSchema } from "./schema";
import type {
  FacilitationInput,
  FacilitatorModel,
  InterviewInput,
  InterviewOutput,
} from "./types";

export type Effort = "low" | "medium" | "high" | "xhigh" | "max";

export interface ClaudeFacilitatorOptions {
  /** 省略時は ANTHROPIC_API_KEY 等の環境変数から解決される */
  client?: Anthropic;
  model?: string;
  /**
   * リアルタイム進行なので既定は medium。
   * 議論が複雑なときは high に上げる。
   */
  effort?: Effort;
  maxTokens?: number;
}

export const DEFAULT_CLAUDE_MODEL = "claude-opus-5";

export class ClaudeRefusalError extends Error {
  constructor(
    public readonly category: string | null | undefined,
    explanation: string | null | undefined,
  ) {
    super(`Claude declined the request: ${explanation ?? "(no explanation)"}`);
    this.name = "ClaudeRefusalError";
  }
}

export class ClaudeParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClaudeParseError";
  }
}

/**
 * Claude をファシリテーターとして使うアダプタ。
 * 構造化出力（output_config.format）で JSON を受け取り、Zod で検証する。
 */
export class ClaudeFacilitatorModel implements FacilitatorModel {
  readonly name: string;
  private readonly client: Anthropic;
  private readonly model: string;
  private readonly effort: Effort;
  private readonly maxTokens: number;

  constructor(options: ClaudeFacilitatorOptions = {}) {
    this.client = options.client ?? new Anthropic();
    this.model = options.model ?? DEFAULT_CLAUDE_MODEL;
    this.effort = options.effort ?? "medium";
    this.maxTokens = options.maxTokens ?? 8000;
    this.name = `claude:${this.model}`;
  }

  async facilitate(input: FacilitationInput): Promise<FacilitationOutput> {
    const response = await this.client.messages.parse({
      model: this.model,
      max_tokens: this.maxTokens,
      thinking: { type: "adaptive" },
      system: [
        {
          type: "text",
          text: FACILITATOR_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        { role: "user", content: buildFacilitationUserMessage(input) },
      ],
      output_config: {
        effort: this.effort,
        format: zodOutputFormat(facilitationOutputSchema),
      },
    });
    assertNotRefused(response);
    if (!response.parsed_output) {
      throw new ClaudeParseError("facilitation output could not be parsed");
    }
    return response.parsed_output;
  }

  async interview(input: InterviewInput): Promise<InterviewOutput> {
    const response = await this.client.messages.parse({
      model: this.model,
      max_tokens: 2000,
      thinking: { type: "adaptive" },
      system: [
        {
          type: "text",
          text: INTERVIEW_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: buildInterviewUserMessage(input) }],
      output_config: {
        effort: "low",
        format: zodOutputFormat(interviewOutputSchema),
      },
    });
    assertNotRefused(response);
    if (!response.parsed_output) {
      throw new ClaudeParseError("interview output could not be parsed");
    }
    return response.parsed_output;
  }
}

function assertNotRefused(response: Anthropic.Message): void {
  if (response.stop_reason === "refusal") {
    const details = response.stop_details;
    throw new ClaudeRefusalError(details?.category, details?.explanation);
  }
}

import type {
  FacilitationInput,
  FacilitatorModel,
  InterviewOutput,
  SpeakerLine,
} from "../llm/types";
import {
  interviewOf,
  latestFacilitation,
  type SessionStore,
  sideOf,
} from "./session";
import type { FacilitationRecord, Interview, Phase, Session } from "./types";

/** AI ファシリテーションを回すフェーズ */
export const FACILITATION_PHASES: readonly Phase[] = [
  "share",
  "cross",
  "plan_c",
];

export interface AutoFacilitatePolicy {
  /** 前回から新しく増えた文字起こしの文字数がこれ以上なら再実行 */
  minNewChars: number;
  /** 前回からこれ以上経過していれば（新規発言が 1 つでもあれば）再実行 */
  minIntervalMs: number;
}

export const DEFAULT_AUTO_POLICY: AutoFacilitatePolicy = {
  minNewChars: 200,
  minIntervalMs: 45_000,
};

export interface FacilitationEngineOptions {
  /** プロンプトに含める直近の発言数 */
  transcriptWindow?: number;
  autoPolicy?: AutoFacilitatePolicy;
  now?: () => number;
}

/**
 * セッションの状態から LLM への入力を組み立て、結果を記録する。
 * Next.js や HTTP に依存しないので、テストから直接呼べる。
 */
export class FacilitationEngine {
  private readonly transcriptWindow: number;
  private readonly autoPolicy: AutoFacilitatePolicy;
  private readonly now: () => number;
  private readonly inFlight = new Set<string>();

  constructor(
    private readonly model: FacilitatorModel,
    private readonly store: SessionStore,
    options: FacilitationEngineOptions = {},
  ) {
    this.transcriptWindow = options.transcriptWindow ?? 60;
    this.autoPolicy = options.autoPolicy ?? DEFAULT_AUTO_POLICY;
    this.now = options.now ?? (() => Date.now());
  }

  get modelName(): string {
    return this.model.name;
  }

  buildInput(session: Session): FacilitationInput {
    const transcript: SpeakerLine[] = session.transcript
      .slice(-this.transcriptWindow)
      .map((seg) => ({
        speakerName: seg.speakerName,
        side: seg.participantId ? sideOf(session, seg.participantId) : null,
        text: seg.text,
        startMs: seg.startMs,
        room: seg.room,
      }));
    return {
      question: session.question,
      phase: session.phase,
      participants: session.participants.map((p) => ({
        name: p.name,
        side: sideOf(session, p.id),
        interviewAnswers:
          interviewOf(session, p.id)
            ?.turns.filter((t) => t.role === "participant")
            .map((t) => t.text) ?? [],
      })),
      transcript,
      previous: latestFacilitation(session)?.output,
    };
  }

  /** 手動トリガー。フェーズに関係なく実行できる */
  async facilitate(sessionId: string): Promise<FacilitationRecord> {
    const session = this.store.get(sessionId);
    if (this.inFlight.has(sessionId)) {
      throw new FacilitationInFlightError(sessionId);
    }
    this.inFlight.add(sessionId);
    try {
      const output = await this.model.facilitate(this.buildInput(session));
      return this.store.recordFacilitation(sessionId, output);
    } finally {
      this.inFlight.delete(sessionId);
    }
  }

  isInFlight(sessionId: string): boolean {
    return this.inFlight.has(sessionId);
  }

  /**
   * 文字起こしが追加されたときに自動実行すべきか。
   * 対象フェーズ外、実行中、変化が少ない場合は false。
   */
  shouldAutoFacilitate(session: Session): boolean {
    if (!FACILITATION_PHASES.includes(session.phase)) {
      return false;
    }
    if (this.inFlight.has(session.id)) {
      return false;
    }
    const last = latestFacilitation(session);
    if (!last) {
      return session.transcript.length > 0;
    }
    const lastIndex = last.lastSegmentId
      ? session.transcript.findIndex((s) => s.id === last.lastSegmentId)
      : -1;
    const newSegments = session.transcript.slice(lastIndex + 1);
    if (newSegments.length === 0) {
      return false;
    }
    const newChars = newSegments.reduce((sum, s) => sum + s.text.length, 0);
    if (newChars >= this.autoPolicy.minNewChars) {
      return true;
    }
    return this.now() - last.createdAt >= this.autoPolicy.minIntervalMs;
  }

  /**
   * AI インタビューを 1 ステップ進める。
   * answer があれば参加者の回答として記録し、次の質問を生成して記録する。
   */
  async interviewStep(
    sessionId: string,
    participantId: string,
    answer?: string,
  ): Promise<{ interview: Interview; output: InterviewOutput }> {
    let session = this.store.get(sessionId);
    if (answer?.trim()) {
      this.store.addInterviewTurn(sessionId, participantId, {
        role: "participant",
        text: answer.trim(),
      });
      session = this.store.get(sessionId);
    }
    const participant = session.participants.find(
      (p) => p.id === participantId,
    );
    if (!participant) {
      throw new Error(`participant ${participantId} not in session`);
    }
    const interview = interviewOf(session, participantId) ?? {
      participantId,
      turns: [],
      done: false,
    };
    const output = await this.model.interview({
      question: session.question,
      participantName: participant.name,
      side: sideOf(session, participantId),
      interview,
    });
    const updated = this.store.addInterviewTurn(
      sessionId,
      participantId,
      { role: "ai", text: output.question },
      { done: output.done },
    );
    return { interview: updated, output };
  }
}

export class FacilitationInFlightError extends Error {
  constructor(sessionId: string) {
    super(`facilitation already running for session ${sessionId}`);
    this.name = "FacilitationInFlightError";
  }
}

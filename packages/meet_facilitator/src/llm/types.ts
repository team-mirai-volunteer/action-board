import type {
  FacilitationOutput,
  Interview,
  Phase,
  Question,
  Side,
} from "../core/types";

export interface SpeakerLine {
  speakerName: string;
  side: Side | null;
  text: string;
  /** 会議開始からの相対ミリ秒 */
  startMs: number;
  room?: string;
}

export interface ParticipantSummary {
  name: string;
  side: Side | null;
  /** AI インタビューでの回答（あれば） */
  interviewAnswers: string[];
}

export interface FacilitationInput {
  question: Question;
  phase: Phase;
  participants: ParticipantSummary[];
  /** 直近の発言（古い順） */
  transcript: SpeakerLine[];
  /** 前回のファシリテーション結果（あれば）。一貫性を保つために渡す */
  previous?: FacilitationOutput;
}

export interface InterviewInput {
  question: Question;
  participantName: string;
  side: Side | null;
  interview: Interview;
}

export interface InterviewOutput {
  question: string;
  done: boolean;
}

/**
 * ファシリテーションの「頭脳」を差し替えられるようにするインターフェース。
 * 本番は ClaudeFacilitatorModel、テストやオフラインデモは MockFacilitatorModel。
 */
export interface FacilitatorModel {
  readonly name: string;
  facilitate(input: FacilitationInput): Promise<FacilitationOutput>;
  interview(input: InterviewInput): Promise<InterviewOutput>;
}

/**
 * Meet AI ファシリテーターのドメイン型。
 *
 * ワークショップの流れ（ゆる語りワークショップを Meet 上で再現し、
 * 最終的に「双方が納得できるプランC」へ導く）:
 *
 *   lobby → vote → interview → share → cross → plan_c → closed
 */

export type Side = "A" | "B";

export type Phase =
  | "lobby" // 参加者が集まるのを待つ
  | "vote" // A / B に投票する
  | "interview" // 一人ずつ AI インタビューに答える
  | "share" // 同じ側同士でインタビュー内容を共有する
  | "cross" // A と B が混ざって合意点・相違点を探る
  | "plan_c" // AI が提案するプランCを磨く
  | "closed";

export const PHASE_ORDER: readonly Phase[] = [
  "lobby",
  "vote",
  "interview",
  "share",
  "cross",
  "plan_c",
  "closed",
];

export const PHASE_LABELS: Record<Phase, string> = {
  lobby: "受付",
  vote: "投票",
  interview: "AIインタビュー",
  share: "同じ意見の人と共有",
  cross: "違う意見の人と対話",
  plan_c: "プランCづくり",
  closed: "終了",
};

export interface Question {
  title: string;
  optionA: string;
  optionB: string;
  /** 問いの背景説明（任意） */
  context?: string;
}

export interface Participant {
  id: string;
  name: string;
  joinedAt: number;
}

export interface Vote {
  participantId: string;
  side: Side;
  votedAt: number;
}

export type TranscriptSource = "recall" | "manual" | "scripted";

export interface TranscriptSegment {
  id: string;
  /** Meet 参加者と紐付いている場合のみ */
  participantId?: string;
  speakerName: string;
  text: string;
  /** 会議開始からの相対ミリ秒 */
  startMs: number;
  endMs?: number;
  source: TranscriptSource;
  /** ブレイクアウトルーム名（メインルームは undefined） */
  room?: string;
}

export interface InterviewTurn {
  role: "ai" | "participant";
  text: string;
  at: number;
}

export interface Interview {
  participantId: string;
  turns: InterviewTurn[];
  done: boolean;
}

export interface Disagreement {
  topic: string;
  sideA: string;
  sideB: string;
  /** 対立の裏にある双方のニーズ・価値観 */
  underlyingNeeds: string;
}

export type PlanCStatus = "not_yet" | "draft" | "ready";

export interface PlanC {
  status: PlanCStatus;
  /** 提案文。status が not_yet のときは空文字 */
  text: string;
  /** A 側のどの関心を満たすか */
  satisfiesA: string[];
  /** B 側のどの関心を満たすか */
  satisfiesB: string[];
  /** まだ合意できていない残論点 */
  openIssues: string[];
}

export interface FacilitationOutput {
  /** 直近の議論の要約（2〜3文） */
  summary: string;
  /** A 側の主張の要点 */
  claimsA: string[];
  /** B 側の主張の要点 */
  claimsB: string[];
  /** 既に見えている共通点 */
  commonGround: string[];
  disagreements: Disagreement[];
  /** ファシリテーターが場に投げかける次の問い */
  nextQuestion: string;
  /** 次に発言を促すべき参加者名（いれば） */
  inviteToSpeak: string[];
  planC: PlanC;
}

export interface FacilitationRecord {
  id: string;
  phase: Phase;
  createdAt: number;
  /** 生成時点で参照した文字起こしの最後のセグメント ID */
  lastSegmentId?: string;
  output: FacilitationOutput;
}

export interface Session {
  id: string;
  question: Question;
  phase: Phase;
  participants: Participant[];
  votes: Vote[];
  transcript: TranscriptSegment[];
  interviews: Interview[];
  facilitations: FacilitationRecord[];
  createdAt: number;
  updatedAt: number;
  /** 更新のたびに増える。クライアントのポーリング差分検知用 */
  version: number;
}

export interface VoteTally {
  A: number;
  B: number;
  notVoted: number;
  byParticipant: Array<{ participant: Participant; side: Side | null }>;
}

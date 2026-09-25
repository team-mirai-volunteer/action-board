import type { TranscriptSegment } from "../core/types";

export type IncomingSegment = Omit<TranscriptSegment, "id">;

export type SegmentHandler = (
  sessionId: string,
  segment: IncomingSegment,
) => void | Promise<void>;

/**
 * 音声→文字起こしの供給源。
 * - RecallTranscriptSource: Recall.ai のボットを Meet に参加させ、Webhook で受け取る
 * - ScriptedTranscriptSource: 台本を時間差で流す（デモ・テスト用）
 * 将来 Google Meet Media API が一般公開されたら、同じインターフェースで差し替える。
 */
export interface TranscriptSource {
  readonly name: string;
  start(sessionId: string, onSegment: SegmentHandler): Promise<void>;
  stop(sessionId: string): Promise<void>;
}

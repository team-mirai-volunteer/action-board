import type {
  IncomingSegment,
  SegmentHandler,
  TranscriptSource,
} from "./types";

export interface ScriptLine {
  speaker: string;
  text: string;
  /** 前の行からの間隔（ミリ秒）。省略時は 0 */
  gapMs?: number;
  room?: string;
}

export interface ScriptedOptions {
  /** 実時間で待つ倍率。0 なら待たずに一気に流す */
  speed?: number;
}

/** 台本を順番に流す（デモ・テスト用） */
export class ScriptedTranscriptSource implements TranscriptSource {
  readonly name = "scripted";
  private stopped = new Set<string>();

  constructor(
    private readonly script: ScriptLine[],
    private readonly options: ScriptedOptions = {},
  ) {}

  async start(sessionId: string, onSegment: SegmentHandler): Promise<void> {
    this.stopped.delete(sessionId);
    const speed = this.options.speed ?? 0;
    let clockMs = 0;
    for (const line of this.script) {
      if (this.stopped.has(sessionId)) {
        return;
      }
      const gap = line.gapMs ?? 0;
      clockMs += gap;
      if (speed > 0 && gap > 0) {
        await sleep(gap / speed);
      }
      const segment: IncomingSegment = {
        speakerName: line.speaker,
        text: line.text,
        startMs: clockMs,
        source: "scripted",
        room: line.room,
      };
      await onSegment(sessionId, segment);
    }
  }

  async stop(sessionId: string): Promise<void> {
    this.stopped.add(sessionId);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

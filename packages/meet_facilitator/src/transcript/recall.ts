import type { IncomingSegment } from "./types";

/**
 * Recall.ai の Meeting Bot を使う実装。
 *
 * 流れ:
 *   1. createRecallBot() で Meet の URL を渡してボットを作る（ボットが参加者として入室する）
 *   2. リアルタイム文字起こしを Webhook（POST /webhooks/recall）で受け取る
 *   3. parseRecallTranscriptEvent() で TranscriptSegment に変換してセッションに積む
 *
 * 注意: Recall.ai の API とペイロード形状は公式ドキュメント
 * （https://docs.recall.ai/docs/real-time-transcription）で最終確認すること。
 * この実装は一般的な形状（transcript.data イベント）に対して寛容にパースする。
 */

export interface RecallBotConfig {
  apiKey: string;
  /** 例: "us-east-1" / "us-west-2" / "ap-northeast-1" */
  region?: string;
  meetingUrl: string;
  /** 本サーバーの公開 URL + /webhooks/recall */
  webhookUrl: string;
  botName?: string;
  /** Webhook 受信時にセッションを特定するために metadata に入れる */
  sessionId: string;
  /** 文字起こしプロバイダ。日本語対応のものを選ぶ */
  transcriptProvider?: Record<string, unknown>;
  fetchImpl?: typeof fetch;
}

export interface RecallBot {
  id: string;
  raw: unknown;
}

export function recallBaseUrl(region = "us-east-1"): string {
  return `https://${region}.recall.ai/api/v1`;
}

export function buildRecallBotRequest(
  config: RecallBotConfig,
): Record<string, unknown> {
  return {
    meeting_url: config.meetingUrl,
    bot_name: config.botName ?? "AI ファシリテーター",
    metadata: { session_id: config.sessionId },
    recording_config: {
      transcript: {
        provider: config.transcriptProvider ?? {
          // 日本語のリアルタイム文字起こしに対応したプロバイダを指定する
          deepgram_streaming: { language: "ja", model: "nova-2" },
        },
      },
      realtime_endpoints: [
        {
          type: "webhook",
          url: config.webhookUrl,
          events: [
            "transcript.data",
            "participant_events.join",
            "participant_events.leave",
          ],
        },
      ],
    },
  };
}

export async function createRecallBot(
  config: RecallBotConfig,
): Promise<RecallBot> {
  const fetchImpl = config.fetchImpl ?? fetch;
  const response = await fetchImpl(`${recallBaseUrl(config.region)}/bot/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildRecallBotRequest(config)),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Recall.ai bot creation failed: ${response.status} ${body}`,
    );
  }
  const raw = (await response.json()) as { id?: string };
  if (!raw.id) {
    throw new Error("Recall.ai bot creation returned no id");
  }
  return { id: raw.id, raw };
}

export async function removeRecallBot(
  config: Pick<RecallBotConfig, "apiKey" | "region" | "fetchImpl">,
  botId: string,
): Promise<void> {
  const fetchImpl = config.fetchImpl ?? fetch;
  const response = await fetchImpl(
    `${recallBaseUrl(config.region)}/bot/${botId}/leave_call/`,
    { method: "POST", headers: { Authorization: `Token ${config.apiKey}` } },
  );
  if (!response.ok && response.status !== 404) {
    throw new Error(`Recall.ai leave_call failed: ${response.status}`);
  }
}

export interface ParsedRecallEvent {
  sessionId: string | undefined;
  segment: IncomingSegment;
}

interface RecallWord {
  text?: string;
  start_timestamp?: { relative?: number; absolute?: string };
  end_timestamp?: { relative?: number; absolute?: string };
}

/**
 * transcript.data イベントを 1 セグメントに変換する。
 * transcript 以外のイベントや空テキストは null。
 */
export function parseRecallTranscriptEvent(
  payload: unknown,
): ParsedRecallEvent | null {
  if (!isRecord(payload)) {
    return null;
  }
  const event = typeof payload.event === "string" ? payload.event : "";
  if (!event.startsWith("transcript.")) {
    return null;
  }
  const data = isRecord(payload.data) ? payload.data : {};
  const inner = isRecord(data.data) ? data.data : data;
  const words = Array.isArray(inner.words) ? (inner.words as RecallWord[]) : [];
  const text = words
    .map((w) => (typeof w.text === "string" ? w.text : ""))
    .join("")
    .trim();
  if (!text) {
    return null;
  }
  const participant = isRecord(inner.participant) ? inner.participant : {};
  const speakerName =
    typeof participant.name === "string" && participant.name
      ? participant.name
      : "不明";
  const bot = isRecord(data.bot) ? data.bot : {};
  const metadata = isRecord(bot.metadata) ? bot.metadata : {};
  const sessionId =
    typeof metadata.session_id === "string" ? metadata.session_id : undefined;
  const startSec = words[0]?.start_timestamp?.relative ?? 0;
  const endSec = words.at(-1)?.end_timestamp?.relative;
  return {
    sessionId,
    segment: {
      speakerName,
      text,
      startMs: Math.round(startSec * 1000),
      endMs: endSec === undefined ? undefined : Math.round(endSec * 1000),
      source: "recall",
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

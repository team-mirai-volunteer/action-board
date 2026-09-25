/**
 * @jest-environment node
 */
import { buildRecallBotRequest, parseRecallTranscriptEvent } from "./recall";

describe("parseRecallTranscriptEvent", () => {
  const payload = {
    event: "transcript.data",
    data: {
      bot: { id: "bot_1", metadata: { session_id: "ses_42" } },
      data: {
        participant: { id: 7, name: "田中" },
        words: [
          {
            text: "安全面が",
            start_timestamp: { relative: 12.5 },
            end_timestamp: { relative: 13 },
          },
          {
            text: "心配です",
            start_timestamp: { relative: 13 },
            end_timestamp: { relative: 13.8 },
          },
        ],
      },
    },
  };

  test("converts a transcript.data event into a segment", () => {
    const parsed = parseRecallTranscriptEvent(payload);
    expect(parsed).toEqual({
      sessionId: "ses_42",
      segment: {
        speakerName: "田中",
        text: "安全面が心配です",
        startMs: 12500,
        endMs: 13800,
        source: "recall",
      },
    });
  });

  test("ignores non-transcript events", () => {
    expect(
      parseRecallTranscriptEvent({
        event: "participant_events.join",
        data: {},
      }),
    ).toBeNull();
    expect(parseRecallTranscriptEvent(null)).toBeNull();
    expect(parseRecallTranscriptEvent("x")).toBeNull();
  });

  test("ignores events without words", () => {
    expect(
      parseRecallTranscriptEvent({
        event: "transcript.data",
        data: { data: { words: [] } },
      }),
    ).toBeNull();
  });
});

describe("buildRecallBotRequest", () => {
  test("includes meeting url, webhook and session metadata", () => {
    const body = buildRecallBotRequest({
      apiKey: "k",
      meetingUrl: "https://meet.google.com/abc-defg-hij",
      webhookUrl: "https://example.com/webhooks/recall",
      sessionId: "ses_1",
    });
    expect(body.meeting_url).toBe("https://meet.google.com/abc-defg-hij");
    expect(body.metadata).toEqual({ session_id: "ses_1" });
    const recording = body.recording_config as {
      realtime_endpoints: Array<{ url: string }>;
    };
    expect(recording.realtime_endpoints[0].url).toBe(
      "https://example.com/webhooks/recall",
    );
  });
});

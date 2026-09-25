/**
 * @jest-environment node
 */
import { MockFacilitatorModel } from "../llm/mock";
import type { FacilitationInput, FacilitatorModel } from "../llm/types";
import { FacilitationEngine } from "./facilitator";
import { SequentialIdGenerator, SessionStore } from "./session";
import type { FacilitationOutput } from "./types";

function setup(model: FacilitatorModel = new MockFacilitatorModel()) {
  let now = 0;
  const clock = { now: () => now };
  const store = new SessionStore(clock, new SequentialIdGenerator());
  const engine = new FacilitationEngine(model, store, {
    now: () => now,
    autoPolicy: { minNewChars: 50, minIntervalMs: 10_000 },
  });
  const session = store.create({
    question: {
      title: "スマホ持ち込み",
      optionA: "認める",
      optionB: "認めない",
    },
  });
  const tanaka = store.join(session.id, { name: "田中" });
  const suzuki = store.join(session.id, { name: "鈴木" });
  store.setPhase(session.id, "vote");
  store.vote(session.id, tanaka.id, "A");
  store.vote(session.id, suzuki.id, "B");
  store.setPhase(session.id, "cross");
  return {
    store,
    engine,
    session,
    tanaka,
    suzuki,
    tick: (ms: number) => {
      now += ms;
    },
  };
}

describe("FacilitationEngine.buildInput", () => {
  test("attaches sides and interview answers", () => {
    const { store, engine, session, tanaka } = setup();
    store.addInterviewTurn(session.id, tanaka.id, {
      role: "ai",
      text: "なぜ？",
    });
    store.addInterviewTurn(session.id, tanaka.id, {
      role: "participant",
      text: "連絡のため",
    });
    store.appendTranscript(session.id, {
      speakerName: "田中",
      text: "緊急時の連絡手段が必要です",
      startMs: 1000,
      source: "manual",
    });
    store.appendTranscript(session.id, {
      speakerName: "ゲスト",
      text: "私は参加者ではありません",
      startMs: 2000,
      source: "manual",
    });
    const input = engine.buildInput(store.get(session.id));
    expect(input.phase).toBe("cross");
    expect(input.participants).toEqual([
      { name: "田中", side: "A", interviewAnswers: ["連絡のため"] },
      { name: "鈴木", side: "B", interviewAnswers: [] },
    ]);
    expect(input.transcript.map((l) => l.side)).toEqual(["A", null]);
  });
});

describe("FacilitationEngine.facilitate", () => {
  test("records the model output on the session", async () => {
    const { store, engine, session } = setup();
    store.appendTranscript(session.id, {
      speakerName: "田中",
      text: "緊急時の連絡手段として安全のために必要です",
      startMs: 0,
      source: "manual",
    });
    store.appendTranscript(session.id, {
      speakerName: "鈴木",
      text: "授業中の集中が削がれるのが心配ですが、安全は大事です",
      startMs: 5000,
      source: "manual",
    });
    const record = await engine.facilitate(session.id);
    expect(record.phase).toBe("cross");
    expect(record.lastSegmentId).toBe(
      store.get(session.id).transcript.at(-1)?.id,
    );
    expect(record.output.claimsA[0]).toContain("田中");
    expect(record.output.claimsB[0]).toContain("鈴木");
    expect(record.output.commonGround.join()).toContain("安全");
    expect(record.output.planC.status).toBe("draft");
    expect(store.get(session.id).facilitations).toHaveLength(1);
  });

  test("prevents concurrent runs for the same session", async () => {
    let release: (() => void) | undefined;
    const slow: FacilitatorModel = {
      name: "slow",
      facilitate: () =>
        new Promise<FacilitationOutput>((resolve) => {
          release = () =>
            resolve({
              summary: "",
              claimsA: [],
              claimsB: [],
              commonGround: [],
              disagreements: [],
              nextQuestion: "",
              inviteToSpeak: [],
              planC: {
                status: "not_yet",
                text: "",
                satisfiesA: [],
                satisfiesB: [],
                openIssues: [],
              },
            });
        }),
      interview: async () => ({ question: "", done: true }),
    };
    const { engine, session } = setup(slow);
    const first = engine.facilitate(session.id);
    await expect(engine.facilitate(session.id)).rejects.toThrow(
      /already running/,
    );
    expect(engine.isInFlight(session.id)).toBe(true);
    release?.();
    await first;
    expect(engine.isInFlight(session.id)).toBe(false);
  });
});

describe("FacilitationEngine.shouldAutoFacilitate", () => {
  test("is false outside facilitation phases", () => {
    const { store, engine, session } = setup();
    store.setPhase(session.id, "vote");
    store.appendTranscript(session.id, {
      speakerName: "田中",
      text: "a",
      startMs: 0,
      source: "manual",
    });
    expect(engine.shouldAutoFacilitate(store.get(session.id))).toBe(false);
  });

  test("first run happens as soon as there is transcript", () => {
    const { store, engine, session } = setup();
    expect(engine.shouldAutoFacilitate(store.get(session.id))).toBe(false);
    store.appendTranscript(session.id, {
      speakerName: "田中",
      text: "a",
      startMs: 0,
      source: "manual",
    });
    expect(engine.shouldAutoFacilitate(store.get(session.id))).toBe(true);
  });

  test("subsequent runs wait for enough new text or elapsed time", async () => {
    const { store, engine, session, tick } = setup();
    store.appendTranscript(session.id, {
      speakerName: "田中",
      text: "最初の発言",
      startMs: 0,
      source: "manual",
    });
    await engine.facilitate(session.id);
    expect(engine.shouldAutoFacilitate(store.get(session.id))).toBe(false);

    store.appendTranscript(session.id, {
      speakerName: "鈴木",
      text: "短い",
      startMs: 1,
      source: "manual",
    });
    expect(engine.shouldAutoFacilitate(store.get(session.id))).toBe(false);

    tick(10_000);
    expect(engine.shouldAutoFacilitate(store.get(session.id))).toBe(true);

    await engine.facilitate(session.id);
    store.appendTranscript(session.id, {
      speakerName: "鈴木",
      text: "あ".repeat(60),
      startMs: 2,
      source: "manual",
    });
    expect(engine.shouldAutoFacilitate(store.get(session.id))).toBe(true);
  });
});

describe("FacilitationEngine.interviewStep", () => {
  test("records the answer and the next AI question", async () => {
    const { store, engine, session, tanaka } = setup();
    store.setPhase(session.id, "interview");
    const first = await engine.interviewStep(session.id, tanaka.id);
    expect(first.interview.turns).toHaveLength(1);
    expect(first.interview.turns[0].role).toBe("ai");
    expect(first.output.done).toBe(false);

    const second = await engine.interviewStep(
      session.id,
      tanaka.id,
      "連絡手段が必要だから",
    );
    expect(second.interview.turns.map((t) => t.role)).toEqual([
      "ai",
      "participant",
      "ai",
    ]);
    expect(store.get(session.id).interviews[0].turns).toHaveLength(3);
  });

  test("mock interview finishes after four answers", async () => {
    const { store, engine, session, tanaka } = setup();
    store.setPhase(session.id, "interview");
    await engine.interviewStep(session.id, tanaka.id);
    let result = await engine.interviewStep(session.id, tanaka.id, "1");
    for (const answer of ["2", "3", "4"]) {
      result = await engine.interviewStep(session.id, tanaka.id, answer);
    }
    expect(result.output.done).toBe(true);
    expect(result.interview.done).toBe(true);
  });
});

describe("MockFacilitatorModel", () => {
  test("invites quiet participants to speak", async () => {
    const model = new MockFacilitatorModel();
    const input: FacilitationInput = {
      question: { title: "t", optionA: "A", optionB: "B" },
      phase: "cross",
      participants: [
        { name: "田中", side: "A", interviewAnswers: [] },
        { name: "鈴木", side: "B", interviewAnswers: [] },
        { name: "見学", side: null, interviewAnswers: [] },
      ],
      transcript: [
        { speakerName: "田中", side: "A", text: "発言", startMs: 0 },
      ],
    };
    const output = await model.facilitate(input);
    expect(output.inviteToSpeak).toEqual(["鈴木"]);
    expect(output.planC.status).toBe("not_yet");
  });
});

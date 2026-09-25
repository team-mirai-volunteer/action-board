/**
 * @jest-environment node
 */
import {
  mixedGroups,
  nextPhase,
  SequentialIdGenerator,
  SessionError,
  SessionStore,
  sameSideGroups,
  voteTally,
} from "./session";

function makeStore() {
  let now = 1_000;
  const clock = { now: () => now++ };
  const store = new SessionStore(clock, new SequentialIdGenerator());
  const session = store.create({
    question: {
      title: "学校へのスマホ持ち込みを認めるべきか",
      optionA: "認める",
      optionB: "認めない",
    },
  });
  return { store, session };
}

describe("SessionStore", () => {
  test("creates a session in the lobby phase", () => {
    const { session } = makeStore();
    expect(session.phase).toBe("lobby");
    expect(session.version).toBe(1);
  });

  test("rejects a question with an empty option", () => {
    const store = new SessionStore();
    expect(() =>
      store.create({ question: { title: "t", optionA: "", optionB: "B" } }),
    ).toThrow(SessionError);
  });

  test("join is idempotent by name", () => {
    const { store, session } = makeStore();
    const first = store.join(session.id, { name: "田中" });
    const second = store.join(session.id, { name: " 田中 " });
    expect(second.id).toBe(first.id);
    expect(session.participants).toHaveLength(1);
  });

  test("voting is only allowed in the vote phase", () => {
    const { store, session } = makeStore();
    const p = store.join(session.id, { name: "田中" });
    expect(() => store.vote(session.id, p.id, "A")).toThrow(/vote phase/);
    store.advancePhase(session.id);
    store.vote(session.id, p.id, "A");
    store.vote(session.id, p.id, "B");
    expect(session.votes).toHaveLength(1);
    expect(session.votes[0].side).toBe("B");
  });

  test("rejects votes from unknown participants", () => {
    const { store, session } = makeStore();
    store.advancePhase(session.id);
    expect(() => store.vote(session.id, "nobody", "A")).toThrow(
      expect.objectContaining({ code: "not_participant" }),
    );
  });

  test("transcript segments are linked to participants by speaker name", () => {
    const { store, session } = makeStore();
    const p = store.join(session.id, { name: "佐藤" });
    const seg = store.appendTranscript(session.id, {
      speakerName: "佐藤",
      text: "  安全面が心配です  ",
      startMs: 0,
      source: "manual",
    });
    expect(seg.participantId).toBe(p.id);
    expect(seg.text).toBe("安全面が心配です");
    expect(session.version).toBe(3);
  });

  test("advancePhase walks the phase order and stops at closed", () => {
    const { store, session } = makeStore();
    const seen = [session.phase];
    while (nextPhase(session.phase)) {
      store.advancePhase(session.id);
      seen.push(session.phase);
    }
    expect(seen).toEqual([
      "lobby",
      "vote",
      "interview",
      "share",
      "cross",
      "plan_c",
      "closed",
    ]);
    expect(() => store.advancePhase(session.id)).toThrow(/closed/);
  });

  test("interview turns accumulate per participant", () => {
    const { store, session } = makeStore();
    const p = store.join(session.id, { name: "佐藤" });
    store.addInterviewTurn(session.id, p.id, {
      role: "ai",
      text: "なぜそう思いますか？",
    });
    const interview = store.addInterviewTurn(
      session.id,
      p.id,
      { role: "participant", text: "連絡手段として必要だから" },
      { done: true },
    );
    expect(interview.turns).toHaveLength(2);
    expect(interview.done).toBe(true);
  });
});

describe("grouping helpers", () => {
  function votedSession() {
    const { store, session } = makeStore();
    store.advancePhase(session.id);
    const names = ["a1", "a2", "a3", "b1", "b2", "n1"];
    const ps = names.map((name) => store.join(session.id, { name }));
    for (const p of ps.slice(0, 3)) store.vote(session.id, p.id, "A");
    for (const p of ps.slice(3, 5)) store.vote(session.id, p.id, "B");
    return { store, session };
  }

  test("voteTally counts A, B and not voted", () => {
    const { session } = votedSession();
    const tally = voteTally(session);
    expect(tally).toMatchObject({ A: 3, B: 2, notVoted: 1 });
    expect(tally.byParticipant.map((v) => v.side)).toEqual([
      "A",
      "A",
      "A",
      "B",
      "B",
      null,
    ]);
  });

  test("sameSideGroups excludes people who did not vote", () => {
    const { session } = votedSession();
    const groups = sameSideGroups(session);
    expect(groups.A.map((p) => p.name)).toEqual(["a1", "a2", "a3"]);
    expect(groups.B.map((p) => p.name)).toEqual(["b1", "b2"]);
  });

  test("mixedGroups spreads both sides across groups", () => {
    const { session } = votedSession();
    const groups = mixedGroups(session, 3);
    expect(groups).toHaveLength(2);
    for (const group of groups) {
      const names = group.map((p) => p.name);
      expect(names.some((n) => n.startsWith("a"))).toBe(true);
      expect(names.some((n) => n.startsWith("b"))).toBe(true);
    }
  });
});

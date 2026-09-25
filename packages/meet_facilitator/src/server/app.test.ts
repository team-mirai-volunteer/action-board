/**
 * @jest-environment node
 */
import { FacilitationEngine } from "../core/facilitator";
import { SequentialIdGenerator, SessionStore } from "../core/session";
import { MockFacilitatorModel } from "../llm/mock";
import { createApp } from "./app";

function setup() {
  const store = new SessionStore({ now: () => 0 }, new SequentialIdGenerator());
  const engine = new FacilitationEngine(new MockFacilitatorModel(), store);
  const app = createApp({
    store,
    engine,
    logger: { info: () => {}, warn: () => {}, error: () => {} },
  });
  const json = async (path: string, body?: unknown, method = "POST") => {
    const res = await app.request(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return {
      status: res.status,
      body: res.status === 304 ? null : await res.json(),
    };
  };
  return { store, engine, app, json };
}

const question = { title: "問い", optionA: "A案", optionB: "B案" };

describe("session API", () => {
  test("create → join → vote → view", async () => {
    const { json } = setup();
    const created = await json("/api/sessions", { question });
    expect(created.status).toBe(201);
    const id = created.body.session.id as string;

    const joined = await json(`/api/sessions/${id}/participants`, {
      name: "田中",
    });
    expect(joined.status).toBe(201);

    await json(`/api/sessions/${id}/phase`, {});
    const voted = await json(`/api/sessions/${id}/votes`, {
      participantId: joined.body.id,
      side: "A",
    });
    expect(voted.status).toBe(201);

    const view = await json(`/api/sessions/${id}`, undefined, "GET");
    expect(view.body.session.phase).toBe("vote");
    expect(view.body.tally).toMatchObject({ A: 1, B: 0, notVoted: 0 });
    expect(view.body.latest).toBeNull();
    expect(view.body.phases[0]).toEqual({ id: "lobby", label: "受付" });
  });

  test("returns 304 when the client already has the latest version", async () => {
    const { json, app } = setup();
    const created = await json("/api/sessions", { question });
    const id = created.body.session.id as string;
    const version = created.body.session.version as number;
    const res = await app.request(`/api/sessions/${id}?since=${version}`);
    expect(res.status).toBe(304);
  });

  test("maps domain errors to http statuses", async () => {
    const { json } = setup();
    expect((await json("/api/sessions/nope", undefined, "GET")).status).toBe(
      404,
    );
    expect(
      (
        await json("/api/sessions", {
          question: { title: "", optionA: "a", optionB: "b" },
        })
      ).status,
    ).toBe(400);
    const created = await json("/api/sessions", { question });
    const id = created.body.session.id as string;
    const p = await json(`/api/sessions/${id}/participants`, { name: "x" });
    const vote = await json(`/api/sessions/${id}/votes`, {
      participantId: p.body.id,
      side: "A",
    });
    expect(vote.status).toBe(409);
  });
});

describe("transcript and facilitation", () => {
  test("transcript in a facilitation phase triggers auto facilitation", async () => {
    const { json, store } = setup();
    const created = await json("/api/sessions", { question });
    const id = created.body.session.id as string;
    await json(`/api/sessions/${id}/participants`, { name: "田中" });
    await json(`/api/sessions/${id}/phase`, { phase: "cross" });

    const seg = await json(`/api/sessions/${id}/transcript`, {
      speakerName: "田中",
      text: "連絡手段として必要です",
    });
    expect(seg.status).toBe(201);
    expect(seg.body.source).toBe("manual");

    await flush();
    expect(store.get(id).facilitations).toHaveLength(1);
  });

  test("manual facilitation returns a record", async () => {
    const { json } = setup();
    const created = await json("/api/sessions", { question });
    const id = created.body.session.id as string;
    const res = await json(`/api/sessions/${id}/facilitate`);
    expect(res.status).toBe(201);
    expect(res.body.output.nextQuestion).toBeTruthy();
  });

  test("interview endpoint records answers", async () => {
    const { json } = setup();
    const created = await json("/api/sessions", { question });
    const id = created.body.session.id as string;
    const p = await json(`/api/sessions/${id}/participants`, { name: "田中" });
    const first = await json(`/api/sessions/${id}/interview/${p.body.id}`, {});
    expect(first.body.interview.turns).toHaveLength(1);
    const second = await json(`/api/sessions/${id}/interview/${p.body.id}`, {
      answer: "理由です",
    });
    expect(second.body.interview.turns).toHaveLength(3);
  });

  test("replay feeds the demo script into the session", async () => {
    const { json, store } = setup();
    const created = await json("/api/sessions", { question });
    const id = created.body.session.id as string;
    await json(`/api/sessions/${id}/phase`, { phase: "cross" });
    const res = await json(`/api/sessions/${id}/replay`, { speed: 0 });
    expect(res.body.completed).toBe(true);
    expect(store.get(id).transcript).toHaveLength(res.body.lines);
  });
});

describe("recall webhook", () => {
  test("appends transcript for the session named in bot metadata", async () => {
    const { json, store } = setup();
    const created = await json("/api/sessions", { question });
    const id = created.body.session.id as string;
    const res = await json("/webhooks/recall", {
      event: "transcript.data",
      data: {
        bot: { metadata: { session_id: id } },
        data: {
          participant: { name: "鈴木" },
          words: [{ text: "こんにちは", start_timestamp: { relative: 1 } }],
        },
      },
    });
    expect(res.body).toEqual({ ok: true });
    expect(store.get(id).transcript[0]).toMatchObject({
      speakerName: "鈴木",
      text: "こんにちは",
      startMs: 1000,
      source: "recall",
    });
  });

  test("ignores unknown sessions and non-transcript events", async () => {
    const { json } = setup();
    const unknown = await json("/webhooks/recall", {
      event: "transcript.data",
      data: {
        bot: { metadata: { session_id: "nope" } },
        data: { words: [{ text: "x" }] },
      },
    });
    expect(unknown.body).toEqual({ ignored: true, reason: "unknown_session" });
    const other = await json("/webhooks/recall", {
      event: "participant_events.join",
    });
    expect(other.body).toEqual({ ignored: true });
  });

  test("bot endpoint reports when recall is not configured", async () => {
    const { json } = setup();
    const created = await json("/api/sessions", { question });
    const res = await json(`/api/sessions/${created.body.session.id}/bot`, {
      meetingUrl: "x",
    });
    expect(res.status).toBe(501);
  });
});

function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

import { Hono } from "hono";
import { cors } from "hono/cors";
import type { FacilitationEngine } from "../core/facilitator";
import { FacilitationInFlightError } from "../core/facilitator";
import {
  latestFacilitation,
  mixedGroups,
  SessionError,
  type SessionStore,
  sameSideGroups,
  voteTally,
} from "../core/session";
import {
  PHASE_LABELS,
  PHASE_ORDER,
  type Phase,
  type Session,
  type Side,
} from "../core/types";
import { WORKSHOP_SCRIPT } from "../demo/script";
import {
  createRecallBot,
  parseRecallTranscriptEvent,
} from "../transcript/recall";
import { ScriptedTranscriptSource } from "../transcript/scripted";
import type { IncomingSegment } from "../transcript/types";

export interface AppDeps {
  store: SessionStore;
  engine: FacilitationEngine;
  /** Recall.ai を使う場合のみ */
  recall?: {
    apiKey: string;
    region?: string;
    /** 本サーバーの公開 URL（Webhook 用） */
    publicUrl: string;
    fetchImpl?: typeof fetch;
  };
  logger?: Pick<Console, "info" | "warn" | "error">;
  /** Meet Add-ons SDK の createAddonSession に渡す GCP プロジェクト番号 */
  cloudProjectNumber?: string;
}

/** クライアント（サイドパネル・メインステージ）に返す集約ビュー */
export function buildSessionView(session: Session, engine: FacilitationEngine) {
  return {
    session,
    tally: voteTally(session),
    groups: { sameSide: sameSideGroups(session), mixed: mixedGroups(session) },
    latest: latestFacilitation(session) ?? null,
    facilitating: engine.isInFlight(session.id),
    modelName: engine.modelName,
    phases: PHASE_ORDER.map((phase) => ({
      id: phase,
      label: PHASE_LABELS[phase],
    })),
  };
}

export function createApp(deps: AppDeps): Hono {
  const { store, engine } = deps;
  const logger = deps.logger ?? console;
  const app = new Hono();

  app.use("/api/*", cors());

  app.onError((err, c) => {
    if (err instanceof SessionError) {
      const status =
        err.code === "not_found"
          ? 404
          : err.code === "invalid_phase"
            ? 409
            : 400;
      return c.json({ error: err.code, message: err.message }, status);
    }
    if (err instanceof FacilitationInFlightError) {
      return c.json({ error: "in_flight", message: err.message }, 409);
    }
    logger.error("[meet-facilitator] unhandled error", err);
    return c.json({ error: "internal", message: err.message }, 500);
  });

  app.get("/api/health", (c) => c.json({ ok: true, model: engine.modelName }));

  app.get("/api/config", (c) =>
    c.json({
      cloudProjectNumber: deps.cloudProjectNumber ?? null,
      recallConfigured: Boolean(deps.recall),
      modelName: engine.modelName,
    }),
  );

  app.get("/api/sessions", (c) =>
    c.json(
      store.list().map((s) => ({
        id: s.id,
        question: s.question,
        phase: s.phase,
        participants: s.participants.length,
        updatedAt: s.updatedAt,
      })),
    ),
  );

  app.post("/api/sessions", async (c) => {
    const body = await readJson<{
      question?: Session["question"];
      id?: string;
    }>(c);
    if (!body.question) {
      throw new SessionError("invalid_input", "question is required");
    }
    const session = store.create({ question: body.question, id: body.id });
    return c.json(buildSessionView(session, engine), 201);
  });

  app.get("/api/sessions/:id", (c) => {
    const session = store.get(c.req.param("id"));
    const since = Number(c.req.query("since") ?? "0");
    if (since && session.version <= since) {
      return c.body(null, 304);
    }
    return c.json(buildSessionView(session, engine));
  });

  app.post("/api/sessions/:id/participants", async (c) => {
    const body = await readJson<{ name?: string; id?: string }>(c);
    if (!body.name) {
      throw new SessionError("invalid_input", "name is required");
    }
    const participant = store.join(c.req.param("id"), {
      name: body.name,
      id: body.id,
    });
    return c.json(participant, 201);
  });

  app.post("/api/sessions/:id/votes", async (c) => {
    const body = await readJson<{ participantId?: string; side?: Side }>(c);
    if (!body.participantId || !body.side) {
      throw new SessionError(
        "invalid_input",
        "participantId and side are required",
      );
    }
    const vote = store.vote(c.req.param("id"), body.participantId, body.side);
    return c.json(vote, 201);
  });

  app.post("/api/sessions/:id/phase", async (c) => {
    const body = await readJson<{ phase?: Phase }>(c);
    const id = c.req.param("id");
    const session = body.phase
      ? store.setPhase(id, body.phase)
      : store.advancePhase(id);
    return c.json(buildSessionView(session, engine));
  });

  app.post("/api/sessions/:id/transcript", async (c) => {
    const body = await readJson<Partial<IncomingSegment>>(c);
    if (!body.speakerName || !body.text) {
      throw new SessionError(
        "invalid_input",
        "speakerName and text are required",
      );
    }
    const id = c.req.param("id");
    const segment = ingestSegment(id, {
      speakerName: body.speakerName,
      text: body.text,
      participantId: body.participantId,
      startMs: body.startMs ?? Date.now() - store.get(id).createdAt,
      endMs: body.endMs,
      room: body.room,
      source: body.source ?? "manual",
    });
    return c.json(segment, 201);
  });

  app.post("/api/sessions/:id/facilitate", async (c) => {
    const record = await engine.facilitate(c.req.param("id"));
    return c.json(record, 201);
  });

  app.post("/api/sessions/:id/interview/:participantId", async (c) => {
    const body = await readJson<{ answer?: string }>(c);
    const result = await engine.interviewStep(
      c.req.param("id"),
      c.req.param("participantId"),
      body.answer,
    );
    return c.json(result);
  });

  /** デモ用: 台本の会話をセッションに流し込む（ボットなしで UI を確認する） */
  app.post("/api/sessions/:id/replay", async (c) => {
    const body = await readJson<{ speed?: number }>(c);
    const id = c.req.param("id");
    store.get(id);
    const source = new ScriptedTranscriptSource(WORKSHOP_SCRIPT, {
      speed: body.speed ?? 0,
    });
    const run = source.start(id, (sessionId, segment) => {
      ingestSegment(sessionId, segment);
    });
    if ((body.speed ?? 0) === 0) {
      await run;
      return c.json({
        started: true,
        completed: true,
        lines: WORKSHOP_SCRIPT.length,
      });
    }
    run.catch((err) => logger.error("[meet-facilitator] replay failed", err));
    return c.json(
      { started: true, completed: false, lines: WORKSHOP_SCRIPT.length },
      202,
    );
  });

  /** Recall.ai ボットを Meet に参加させる */
  app.post("/api/sessions/:id/bot", async (c) => {
    if (!deps.recall) {
      return c.json(
        {
          error: "not_configured",
          message: "RECALL_API_KEY と PUBLIC_URL を設定してください",
        },
        501,
      );
    }
    const body = await readJson<{ meetingUrl?: string }>(c);
    if (!body.meetingUrl) {
      throw new SessionError("invalid_input", "meetingUrl is required");
    }
    const id = c.req.param("id");
    store.get(id);
    const bot = await createRecallBot({
      apiKey: deps.recall.apiKey,
      region: deps.recall.region,
      meetingUrl: body.meetingUrl,
      webhookUrl: `${deps.recall.publicUrl.replace(/\/$/, "")}/webhooks/recall`,
      sessionId: id,
      fetchImpl: deps.recall.fetchImpl,
    });
    return c.json({ botId: bot.id }, 201);
  });

  /** Recall.ai のリアルタイム文字起こし Webhook */
  app.post("/webhooks/recall", async (c) => {
    const payload = await c.req.json().catch(() => null);
    const parsed = parseRecallTranscriptEvent(payload);
    if (!parsed) {
      return c.json({ ignored: true });
    }
    const sessionId = parsed.sessionId ?? c.req.query("session");
    if (!sessionId) {
      logger.warn("[meet-facilitator] recall event without session id");
      return c.json({ ignored: true, reason: "no_session" });
    }
    try {
      ingestSegment(sessionId, parsed.segment);
    } catch (err) {
      if (err instanceof SessionError && err.code === "not_found") {
        return c.json({ ignored: true, reason: "unknown_session" });
      }
      throw err;
    }
    return c.json({ ok: true });
  });

  function ingestSegment(sessionId: string, segment: IncomingSegment) {
    const created = store.appendTranscript(sessionId, segment);
    const session = store.get(sessionId);
    if (engine.shouldAutoFacilitate(session)) {
      engine.facilitate(sessionId).catch((err) => {
        logger.error("[meet-facilitator] auto facilitation failed", err);
      });
    }
    return created;
  }

  return app;
}

async function readJson<T>(c: {
  req: { json: () => Promise<unknown> };
}): Promise<T> {
  try {
    return (await c.req.json()) as T;
  } catch {
    return {} as T;
  }
}

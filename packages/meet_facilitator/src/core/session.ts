import type {
  FacilitationOutput,
  FacilitationRecord,
  Interview,
  InterviewTurn,
  Participant,
  Phase,
  Question,
  Session,
  Side,
  TranscriptSegment,
  Vote,
  VoteTally,
} from "./types";
import { PHASE_ORDER } from "./types";

export type SessionErrorCode =
  | "not_found"
  | "invalid_phase"
  | "invalid_input"
  | "not_participant";

export class SessionError extends Error {
  constructor(
    public readonly code: SessionErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "SessionError";
  }
}

export interface Clock {
  now(): number;
}

export interface IdGenerator {
  next(prefix: string): string;
}

const defaultClock: Clock = { now: () => Date.now() };

export class SequentialIdGenerator implements IdGenerator {
  private counter = 0;
  next(prefix: string): string {
    this.counter += 1;
    return `${prefix}_${this.counter.toString(36)}`;
  }
}

export class RandomIdGenerator implements IdGenerator {
  next(prefix: string): string {
    const rand = Math.random().toString(36).slice(2, 10);
    return `${prefix}_${Date.now().toString(36)}${rand}`;
  }
}

export interface CreateSessionInput {
  question: Question;
  id?: string;
}

/**
 * インメモリのセッションストア。
 * プロトタイプなのでプロセス内に保持する。永続化が必要になったら
 * 同じインターフェースで Supabase 実装に差し替える。
 */
export class SessionStore {
  private readonly sessions = new Map<string, Session>();

  constructor(
    private readonly clock: Clock = defaultClock,
    private readonly ids: IdGenerator = new RandomIdGenerator(),
  ) {}

  create(input: CreateSessionInput): Session {
    validateQuestion(input.question);
    const now = this.clock.now();
    const session: Session = {
      id: input.id ?? this.ids.next("ses"),
      question: input.question,
      phase: "lobby",
      participants: [],
      votes: [],
      transcript: [],
      interviews: [],
      facilitations: [],
      createdAt: now,
      updatedAt: now,
      version: 1,
    };
    this.sessions.set(session.id, session);
    return session;
  }

  get(id: string): Session {
    const session = this.sessions.get(id);
    if (!session) {
      throw new SessionError("not_found", `session ${id} not found`);
    }
    return session;
  }

  list(): Session[] {
    return Array.from(this.sessions.values());
  }

  join(
    sessionId: string,
    participant: { id?: string; name: string },
  ): Participant {
    const session = this.get(sessionId);
    const name = participant.name.trim();
    if (!name) {
      throw new SessionError("invalid_input", "participant name is required");
    }
    const existing = participant.id
      ? session.participants.find((p) => p.id === participant.id)
      : session.participants.find((p) => p.name === name);
    if (existing) {
      return existing;
    }
    const created: Participant = {
      id: participant.id ?? this.ids.next("p"),
      name,
      joinedAt: this.clock.now(),
    };
    session.participants.push(created);
    this.touch(session);
    return created;
  }

  setPhase(sessionId: string, phase: Phase): Session {
    const session = this.get(sessionId);
    if (!PHASE_ORDER.includes(phase)) {
      throw new SessionError("invalid_input", `unknown phase ${phase}`);
    }
    session.phase = phase;
    this.touch(session);
    return session;
  }

  advancePhase(sessionId: string): Session {
    const session = this.get(sessionId);
    const next = nextPhase(session.phase);
    if (!next) {
      throw new SessionError("invalid_phase", "session is already closed");
    }
    return this.setPhase(sessionId, next);
  }

  vote(sessionId: string, participantId: string, side: Side): Vote {
    const session = this.get(sessionId);
    if (session.phase !== "vote") {
      throw new SessionError(
        "invalid_phase",
        `voting is only allowed in the vote phase (current: ${session.phase})`,
      );
    }
    this.requireParticipant(session, participantId);
    if (side !== "A" && side !== "B") {
      throw new SessionError("invalid_input", "side must be A or B");
    }
    const existing = session.votes.find(
      (v) => v.participantId === participantId,
    );
    const votedAt = this.clock.now();
    if (existing) {
      existing.side = side;
      existing.votedAt = votedAt;
      this.touch(session);
      return existing;
    }
    const vote = { participantId, side, votedAt };
    session.votes.push(vote);
    this.touch(session);
    return vote;
  }

  appendTranscript(
    sessionId: string,
    segment: Omit<TranscriptSegment, "id"> & { id?: string },
  ): TranscriptSegment {
    const session = this.get(sessionId);
    const text = segment.text.trim();
    if (!text) {
      throw new SessionError("invalid_input", "transcript text is empty");
    }
    const created: TranscriptSegment = {
      ...segment,
      id: segment.id ?? this.ids.next("t"),
      text,
      participantId:
        segment.participantId ??
        matchParticipantByName(session, segment.speakerName)?.id,
    };
    session.transcript.push(created);
    this.touch(session);
    return created;
  }

  addInterviewTurn(
    sessionId: string,
    participantId: string,
    turn: Omit<InterviewTurn, "at">,
    options: { done?: boolean } = {},
  ): Interview {
    const session = this.get(sessionId);
    this.requireParticipant(session, participantId);
    let interview = session.interviews.find(
      (i) => i.participantId === participantId,
    );
    if (!interview) {
      interview = { participantId, turns: [], done: false };
      session.interviews.push(interview);
    }
    interview.turns.push({ ...turn, at: this.clock.now() });
    if (options.done !== undefined) {
      interview.done = options.done;
    }
    this.touch(session);
    return interview;
  }

  recordFacilitation(
    sessionId: string,
    output: FacilitationOutput,
  ): FacilitationRecord {
    const session = this.get(sessionId);
    const record: FacilitationRecord = {
      id: this.ids.next("f"),
      phase: session.phase,
      createdAt: this.clock.now(),
      lastSegmentId: session.transcript.at(-1)?.id,
      output,
    };
    session.facilitations.push(record);
    this.touch(session);
    return record;
  }

  private requireParticipant(
    session: Session,
    participantId: string,
  ): Participant {
    const participant = session.participants.find(
      (p) => p.id === participantId,
    );
    if (!participant) {
      throw new SessionError(
        "not_participant",
        `participant ${participantId} not in session`,
      );
    }
    return participant;
  }

  private touch(session: Session): void {
    session.updatedAt = this.clock.now();
    session.version += 1;
  }
}

export function nextPhase(phase: Phase): Phase | null {
  const index = PHASE_ORDER.indexOf(phase);
  if (index < 0 || index === PHASE_ORDER.length - 1) {
    return null;
  }
  return PHASE_ORDER[index + 1];
}

export function validateQuestion(question: Question): void {
  for (const key of ["title", "optionA", "optionB"] as const) {
    if (!question[key] || !question[key].trim()) {
      throw new SessionError("invalid_input", `question.${key} is required`);
    }
  }
}

export function sideOf(session: Session, participantId: string): Side | null {
  return (
    session.votes.find((v) => v.participantId === participantId)?.side ?? null
  );
}

export function voteTally(session: Session): VoteTally {
  const byParticipant = session.participants.map((participant) => ({
    participant,
    side: sideOf(session, participant.id),
  }));
  return {
    A: byParticipant.filter((v) => v.side === "A").length,
    B: byParticipant.filter((v) => v.side === "B").length,
    notVoted: byParticipant.filter((v) => v.side === null).length,
    byParticipant,
  };
}

/** 同じ側同士のグループ（share フェーズ用） */
export function sameSideGroups(session: Session): {
  A: Participant[];
  B: Participant[];
} {
  const groups = { A: [] as Participant[], B: [] as Participant[] };
  for (const participant of session.participants) {
    const side = sideOf(session, participant.id);
    if (side) {
      groups[side].push(participant);
    }
  }
  return groups;
}

/**
 * A と B を混ぜた小グループ（cross フェーズ用）。
 * それぞれの側を均等に割り、最大 groupSize 人のグループを作る。
 */
export function mixedGroups(session: Session, groupSize = 4): Participant[][] {
  const { A, B } = sameSideGroups(session);
  const groupCount = Math.max(1, Math.ceil((A.length + B.length) / groupSize));
  const groups: Participant[][] = Array.from({ length: groupCount }, () => []);
  A.forEach((p, i) => {
    groups[i % groupCount].push(p);
  });
  B.forEach((p, i) => {
    groups[i % groupCount].push(p);
  });
  return groups.filter((g) => g.length > 0);
}

export function matchParticipantByName(
  session: Session,
  speakerName: string,
): Participant | undefined {
  const normalized = speakerName.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }
  return session.participants.find(
    (p) => p.name.trim().toLowerCase() === normalized,
  );
}

export function latestFacilitation(
  session: Session,
): FacilitationRecord | undefined {
  return session.facilitations.at(-1);
}

export function interviewOf(
  session: Session,
  participantId: string,
): Interview | undefined {
  return session.interviews.find((i) => i.participantId === participantId);
}

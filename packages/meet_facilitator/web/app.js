/**
 * サイドパネル・メインステージ共通のクライアントロジック。
 * バンドラなしで動かすため、素の ES Module として書いている。
 */

const api = {
  async request(path, options = {}) {
    const res = await fetch(path, {
      headers: { "Content-Type": "application/json" },
      ...options,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    if (res.status === 304) {
      return null;
    }
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error = new Error(body.message || `HTTP ${res.status}`);
      error.status = res.status;
      error.code = body.error;
      throw error;
    }
    return body;
  },
  config: () => api.request("/api/config"),
  getSession: (id, since) =>
    api.request(
      `/api/sessions/${encodeURIComponent(id)}${since ? `?since=${since}` : ""}`,
    ),
  createSession: (question, id) =>
    api.request("/api/sessions", { method: "POST", body: { question, id } }),
  join: (id, name) =>
    api.request(`/api/sessions/${id}/participants`, {
      method: "POST",
      body: { name },
    }),
  vote: (id, participantId, side) =>
    api.request(`/api/sessions/${id}/votes`, {
      method: "POST",
      body: { participantId, side },
    }),
  setPhase: (id, phase) =>
    api.request(`/api/sessions/${id}/phase`, {
      method: "POST",
      body: phase ? { phase } : {},
    }),
  facilitate: (id) =>
    api.request(`/api/sessions/${id}/facilitate`, { method: "POST" }),
  interview: (id, participantId, answer) =>
    api.request(`/api/sessions/${id}/interview/${participantId}`, {
      method: "POST",
      body: { answer },
    }),
  replay: (id, speed) =>
    api.request(`/api/sessions/${id}/replay`, {
      method: "POST",
      body: { speed },
    }),
  transcript: (id, speakerName, text) =>
    api.request(`/api/sessions/${id}/transcript`, {
      method: "POST",
      body: { speakerName, text },
    }),
  bot: (id, meetingUrl) =>
    api.request(`/api/sessions/${id}/bot`, {
      method: "POST",
      body: { meetingUrl },
    }),
};

/**
 * Meet Add-ons SDK を初期化する。Meet の外（ローカル確認）では null を返す。
 * @param {"SIDE_PANEL" | "MAIN_STAGE"} frame
 */
async function initMeet(frame, cloudProjectNumber) {
  if (!cloudProjectNumber) {
    return null;
  }
  try {
    const { meet } = await import("/vendor/meet.addons.mjs");
    const session = await meet.addon.createAddonSession({ cloudProjectNumber });
    const client =
      frame === "SIDE_PANEL"
        ? await session.createSidePanelClient()
        : await session.createMainStageClient();
    const meetingInfo = await client.getMeetingInfo();
    return { client, meetingInfo };
  } catch (error) {
    console.warn(
      "[meet-facilitator] Meet SDK unavailable, running standalone",
      error,
    );
    return null;
  }
}

/**
 * セッション ID の解決順:
 *   1. URL の ?session=
 *   2. Meet の meetingCode（同じ会議の参加者が自動的に同じセッションを共有する）
 *   3. Meet の activityStartingState.additionalData
 */
async function resolveSessionId(meet) {
  const fromQuery = new URLSearchParams(location.search).get("session");
  if (fromQuery) {
    return fromQuery;
  }
  if (meet?.client) {
    try {
      const state = await meet.client.getActivityStartingState();
      if (state?.additionalData) {
        const data = JSON.parse(state.additionalData);
        if (data.sessionId) {
          return data.sessionId;
        }
      }
    } catch {
      // 起動状態が無い場合は meetingCode にフォールバック
    }
    if (meet.meetingInfo?.meetingCode) {
      return meet.meetingInfo.meetingCode;
    }
  }
  return null;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function sideTag(side) {
  if (side === "A") return '<span class="tag a">A</span>';
  if (side === "B") return '<span class="tag b">B</span>';
  return '<span class="tag none">未投票</span>';
}

function phaseBar(view) {
  const currentIndex = view.phases.findIndex(
    (p) => p.id === view.session.phase,
  );
  return `<div class="phase-bar">${view.phases
    .map((p, i) => {
      const cls =
        i < currentIndex ? "done" : i === currentIndex ? "current" : "";
      return `<span class="step ${cls}">${escapeHtml(p.label)}</span>`;
    })
    .join("")}</div>`;
}

function list(items, empty = "（なし）") {
  if (!items || items.length === 0) {
    return `<p class="muted">${empty}</p>`;
  }
  return `<ul>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
}

/**
 * セッションを version ベースでポーリングし、変化があれば onChange を呼ぶ。
 */
function watchSession(id, onChange, intervalMs = 2000) {
  let version = 0;
  let timer = null;
  const tick = async () => {
    try {
      const view = await api.getSession(id, version);
      if (view) {
        version = view.session.version;
        onChange(view);
      }
    } catch (error) {
      onChange(null, error);
    }
    timer = setTimeout(tick, intervalMs);
  };
  tick();
  return () => clearTimeout(timer);
}

export {
  api,
  escapeHtml,
  initMeet,
  list,
  phaseBar,
  resolveSessionId,
  sideTag,
  watchSession,
};

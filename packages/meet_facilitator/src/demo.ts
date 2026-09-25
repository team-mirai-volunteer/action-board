/**
 * ボットも Meet も使わずに、台本の会話をファシリテーションエンジンに流すデモ。
 *
 *   pnpm --filter @action-board/meet-facilitator demo
 *
 * ANTHROPIC_API_KEY があれば Claude、なければモックで動く。
 */
import { FacilitationEngine } from "./core/facilitator";
import { SessionStore } from "./core/session";
import type { FacilitationOutput } from "./core/types";
import {
  DEMO_PARTICIPANTS,
  DEMO_QUESTION,
  WORKSHOP_SCRIPT,
} from "./demo/script";
import { createModelFromEnv } from "./llm";
import { ScriptedTranscriptSource } from "./transcript/scripted";

async function main() {
  const store = new SessionStore();
  const model = createModelFromEnv();
  const engine = new FacilitationEngine(model, store, {
    autoPolicy: { minNewChars: 150, minIntervalMs: 0 },
  });
  console.log(`モデル: ${model.name}\n`);

  const session = store.create({ question: DEMO_QUESTION });
  const participants = DEMO_PARTICIPANTS.map((p) => ({
    ...p,
    participant: store.join(session.id, { name: p.name }),
  }));
  store.setPhase(session.id, "vote");
  for (const p of participants) {
    store.vote(session.id, p.participant.id, p.side);
  }

  console.log("== AI インタビュー（田中さん）==");
  const tanaka = participants[0].participant;
  store.setPhase(session.id, "interview");
  let step = await engine.interviewStep(session.id, tanaka.id);
  console.log(`AI: ${step.output.question}`);
  const answers = [
    "塾の帰りが遅い日があって、連絡が取れないと不安だからです。",
    "以前、台風の日に子どもと連絡が取れず、迎えに行けなかったことがあります。",
    "授業中に使わせたくないという気持ちは分かります。",
  ];
  for (const answer of answers) {
    console.log(`田中: ${answer}`);
    step = await engine.interviewStep(session.id, tanaka.id, answer);
    console.log(`AI: ${step.output.question}`);
    if (step.output.done) break;
  }

  console.log("\n== 対話フェーズ（cross）==");
  store.setPhase(session.id, "cross");
  const source = new ScriptedTranscriptSource(WORKSHOP_SCRIPT);
  let runs = 0;
  await source.start(session.id, async (sessionId, segment) => {
    console.log(`${segment.speakerName}: ${segment.text}`);
    store.appendTranscript(sessionId, segment);
    if (engine.shouldAutoFacilitate(store.get(sessionId))) {
      runs += 1;
      const record = await engine.facilitate(sessionId);
      printFacilitation(runs, record.output);
    }
  });

  console.log("\n== プランC フェーズ ==");
  store.setPhase(session.id, "plan_c");
  const final = await engine.facilitate(session.id);
  printFacilitation(runs + 1, final.output);
}

function printFacilitation(n: number, out: FacilitationOutput) {
  console.log(`\n--- AI ファシリテーション #${n} ---`);
  console.log(`要約: ${out.summary}`);
  console.log(`A側: ${out.claimsA.join(" / ")}`);
  console.log(`B側: ${out.claimsB.join(" / ")}`);
  console.log(`共通点: ${out.commonGround.join(" / ") || "（まだなし）"}`);
  for (const d of out.disagreements) {
    console.log(
      `相違点[${d.topic}] A: ${d.sideA} | B: ${d.sideB} | ニーズ: ${d.underlyingNeeds}`,
    );
  }
  console.log(`次の問い: ${out.nextQuestion}`);
  if (out.inviteToSpeak.length)
    console.log(`発言を促す: ${out.inviteToSpeak.join("、")}`);
  console.log(`プランC(${out.planC.status}): ${out.planC.text || "—"}`);
  if (out.planC.openIssues.length)
    console.log(`残論点: ${out.planC.openIssues.join(" / ")}`);
  console.log("");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

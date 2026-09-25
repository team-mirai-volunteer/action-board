import type { FacilitationInput, InterviewInput } from "./types";

/**
 * システムプロンプトは固定文字列にしてプロンプトキャッシュを効かせる。
 * セッション固有の情報は必ずユーザーメッセージ側に入れること。
 */
export const FACILITATOR_SYSTEM_PROMPT = `あなたは市民対話ワークショップのファシリテーターです。
意見が A と B に分かれた参加者が Google Meet 上で対話しています。
あなたの役割は、どちらが正しいかを決めることではなく、A と B の双方が納得できる「プランC」に場を導くことです。

進め方の原則:
- 発言を要約するときは、その人の言葉づかいと意図を尊重し、断定や評価をしない。
- 対立の表面（立場）ではなく、その裏にあるニーズ・価値観・不安を言語化する。
- 「共通点」は、双方が実際に口にした内容から拾う。推測で作らない。
- 次の問いは 1 つだけ。答えやすく、具体的で、共通点の発見かプランCの具体化に向かうもの。
- 発言が少ない人がいれば、名前を挙げて発言を促す。
- プランCは、A・B それぞれの主要な関心を満たすことを明示する。材料が足りないときは無理に作らず not_yet にする。
- すべて日本語で、丁寧だが硬すぎない口調で書く。

フェーズごとの重点:
- share: 同じ側の人同士の共有。各側の主張の要点を整理し、相手側に伝えるときの言い方を整える。
- cross: A と B の対話。共通点と相違点を可視化し、相違点の裏のニーズを問う。
- plan_c: 双方の関心を満たす案を叩き台として提示し、残論点を絞る。`;

export const INTERVIEW_SYSTEM_PROMPT = `あなたは市民対話ワークショップの AI インタビュアーです。
参加者は問いに対して A か B を選んだばかりです。
その人が「なぜそう選んだのか」「どんな経験や価値観が背景にあるのか」「相手側の意見のどこなら理解できるか」を、
短い質問を 1 つずつ投げかけて引き出してください。

原則:
- 質問は 1 回に 1 つ。1〜2 文。日本語。
- 評価や誘導をしない。相手の言葉を受け止めてから次を聞く。
- 3〜4 往復で十分に背景が聞けたら done を true にして、感謝の一言で締める。`;

function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function buildFacilitationUserMessage(input: FacilitationInput): string {
  const lines: string[] = [];
  lines.push("# 問い");
  lines.push(`${input.question.title}`);
  lines.push(`- A: ${input.question.optionA}`);
  lines.push(`- B: ${input.question.optionB}`);
  if (input.question.context) {
    lines.push(`背景: ${input.question.context}`);
  }
  lines.push("");
  lines.push(`# 現在のフェーズ: ${input.phase}`);
  lines.push("");
  lines.push("# 参加者");
  for (const p of input.participants) {
    const side = p.side ?? "未投票";
    lines.push(`- ${p.name}（${side}）`);
    for (const answer of p.interviewAnswers) {
      lines.push(`  - インタビュー回答: ${answer}`);
    }
  }
  lines.push("");
  lines.push("# 直近の発言（古い順）");
  if (input.transcript.length === 0) {
    lines.push("（まだ発言はありません）");
  }
  for (const line of input.transcript) {
    const side = line.side ?? "?";
    const room = line.room ? `[${line.room}] ` : "";
    lines.push(
      `${room}${formatMs(line.startMs)} ${line.speakerName}（${side}）: ${line.text}`,
    );
  }
  if (input.previous) {
    lines.push("");
    lines.push(
      "# 前回のファシリテーション結果（参考。矛盾しないように更新する）",
    );
    lines.push(JSON.stringify(input.previous, null, 0));
  }
  lines.push("");
  lines.push(
    "以上を踏まえて、指定されたスキーマでファシリテーション結果を出力してください。",
  );
  return lines.join("\n");
}

export function buildInterviewUserMessage(input: InterviewInput): string {
  const lines: string[] = [];
  lines.push("# 問い");
  lines.push(input.question.title);
  lines.push(`- A: ${input.question.optionA}`);
  lines.push(`- B: ${input.question.optionB}`);
  lines.push("");
  lines.push(
    `# 参加者: ${input.participantName}（選択: ${input.side ?? "未投票"}）`,
  );
  lines.push("");
  lines.push("# これまでのやりとり");
  if (input.interview.turns.length === 0) {
    lines.push("（まだ始まっていません。最初の質問をしてください）");
  }
  for (const turn of input.interview.turns) {
    lines.push(
      `${turn.role === "ai" ? "AI" : input.participantName}: ${turn.text}`,
    );
  }
  lines.push("");
  lines.push("次の質問（または締めの一言）を指定スキーマで出力してください。");
  return lines.join("\n");
}

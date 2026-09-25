import type { FacilitationOutput, PlanC } from "../core/types";
import type {
  FacilitationInput,
  FacilitatorModel,
  InterviewInput,
  InterviewOutput,
  SpeakerLine,
} from "./types";

/**
 * API キーなしで動かすためのルールベースのモック。
 * 出力の「形」と UI の流れを確認する目的で、内容の質は問わない。
 */
export class MockFacilitatorModel implements FacilitatorModel {
  readonly name = "mock";

  async facilitate(input: FacilitationInput): Promise<FacilitationOutput> {
    const linesA = input.transcript.filter((l) => l.side === "A");
    const linesB = input.transcript.filter((l) => l.side === "B");
    const claimsA = lastClaims(linesA);
    const claimsB = lastClaims(linesB);
    const commonGround = sharedKeywords(linesA, linesB).map(
      (kw) => `「${kw}」については双方が言及しています`,
    );
    const quiet = input.participants
      .filter((p) => p.side !== null)
      .filter((p) => !input.transcript.some((l) => l.speakerName === p.name))
      .map((p) => p.name)
      .slice(0, 2);

    const disagreements =
      claimsA.length && claimsB.length
        ? [
            {
              topic: input.question.title,
              sideA: claimsA[0],
              sideB: claimsB[0],
              underlyingNeeds:
                "A側・B側それぞれが大事にしていることを、まず言葉にして確かめる必要があります。",
            },
          ]
        : [];

    return {
      summary: summarize(input, linesA.length, linesB.length),
      claimsA,
      claimsB,
      commonGround,
      disagreements,
      nextQuestion: nextQuestionFor(input, commonGround.length),
      inviteToSpeak: quiet,
      planC: planCFor(input, claimsA, claimsB, commonGround),
    };
  }

  async interview(input: InterviewInput): Promise<InterviewOutput> {
    const answered = input.interview.turns.filter(
      (t) => t.role === "participant",
    ).length;
    const chosen =
      input.side === "A"
        ? input.question.optionA
        : input.side === "B"
          ? input.question.optionB
          : "その選択";
    const questions = [
      `${input.participantName}さんは「${chosen}」を選びました。そう考える一番の理由を教えてください。`,
      "その考えにつながった経験や出来事があれば教えてください。",
      "反対の立場の人の意見で、「ここは分かる」と思える部分はありますか？",
      "もし両方の立場が納得できる案があるとしたら、どんな条件が必要だと思いますか？",
    ];
    if (answered >= questions.length) {
      return {
        question:
          "ありがとうございました。お話しいただいた内容は、この後の対話で活かします。",
        done: true,
      };
    }
    return { question: questions[answered], done: false };
  }
}

function lastClaims(lines: SpeakerLine[], count = 3): string[] {
  return lines
    .slice(-count)
    .map((l) => `${l.speakerName}: ${l.text.slice(0, 60)}`)
    .reverse();
}

function summarize(input: FacilitationInput, a: number, b: number): string {
  if (a + b === 0) {
    return "まだ発言がありません。まずはそれぞれの立場から一言ずつ話してもらいましょう。";
  }
  return `「${input.question.title}」について、A側から${a}件、B側から${b}件の発言がありました。`;
}

function nextQuestionFor(
  input: FacilitationInput,
  commonCount: number,
): string {
  switch (input.phase) {
    case "share":
      return "同じ側の方同士で、インタビューで答えた「一番の理由」を共有してください。共通していたものはありますか？";
    case "cross":
      return commonCount > 0
        ? "共通点として挙がったことを前提にすると、どこまでなら相手の案を受け入れられますか？"
        : "相手の意見の中で「それは自分も大事だと思う」と感じた部分を一つ挙げてください。";
    case "plan_c":
      return "叩き台の案で、あなたの側として「ここだけは譲れない」ところはどこですか？";
    default:
      return "まず、それぞれの立場から一言ずつ理由を話してください。";
  }
}

function planCFor(
  input: FacilitationInput,
  claimsA: string[],
  claimsB: string[],
  commonGround: string[],
): PlanC {
  const ready = input.phase === "plan_c" || input.phase === "cross";
  if (!ready || claimsA.length === 0 || claimsB.length === 0) {
    return {
      status: "not_yet",
      text: "",
      satisfiesA: [],
      satisfiesB: [],
      openIssues: [],
    };
  }
  return {
    status: input.phase === "plan_c" ? "ready" : "draft",
    text: `「${input.question.optionA}」と「${input.question.optionB}」の両方の関心を取り入れ、条件付きで段階的に進める案（叩き台）。`,
    satisfiesA: claimsA.slice(0, 1),
    satisfiesB: claimsB.slice(0, 1),
    openIssues:
      commonGround.length === 0 ? ["共通点をまだ確認できていません"] : [],
  };
}

// ルートの tsconfig（target es5）でも型検査が通るよう、\p{...} と u フラグは使わずコード範囲で書く
const HAN = "\\u3400-\\u4dbf\\u4e00-\\u9fff";
const KATAKANA = "\\u30a0-\\u30ff";
const KEYWORD_PATTERN = new RegExp(
  `[${HAN}]{2,}|[${KATAKANA}]{2,}|[A-Za-z0-9]{2,}`,
  "g",
);
const HAN_ONLY_PATTERN = new RegExp(`^[${HAN}]+$`);

/** 漢字・カタカナ・英数字の 2 文字以上の連続を「キーワード」とみなす素朴な抽出 */
export function extractKeywords(text: string): Set<string> {
  const matches = text.match(KEYWORD_PATTERN) ?? [];
  const keywords = new Set<string>();
  for (const match of matches) {
    keywords.add(match);
    // 「連絡手段」と「連絡」のように部分一致する語も拾えるよう、漢字は 2 文字ずつにも分ける
    if (HAN_ONLY_PATTERN.test(match) && match.length > 2) {
      for (let i = 0; i + 2 <= match.length; i += 1) {
        keywords.add(match.slice(i, i + 2));
      }
    }
  }
  return keywords;
}

export function sharedKeywords(a: SpeakerLine[], b: SpeakerLine[]): string[] {
  const kwA = extractKeywords(a.map((l) => l.text).join("\n"));
  const kwB = extractKeywords(b.map((l) => l.text).join("\n"));
  const shared = Array.from(kwA).filter((k) => kwB.has(k));
  // 「授業中」と「授業」のように包含関係にある語は長い方だけ残す
  return shared
    .filter((k) => !shared.some((other) => other !== k && other.includes(k)))
    .slice(0, 5);
}

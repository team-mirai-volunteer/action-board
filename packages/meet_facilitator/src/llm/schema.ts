import { z } from "zod/v4";

/**
 * Claude の構造化出力（output_config.format）に渡すスキーマ。
 * core/types.ts の FacilitationOutput と 1:1 で対応させる。
 */
export const facilitationOutputSchema = z.object({
  summary: z.string().describe("直近の議論の要約。2〜3文、日本語"),
  claimsA: z.array(z.string()).describe("A側の主張の要点。箇条書き"),
  claimsB: z.array(z.string()).describe("B側の主張の要点。箇条書き"),
  commonGround: z
    .array(z.string())
    .describe("A・B双方がすでに共有している価値観・目的・事実"),
  disagreements: z.array(
    z.object({
      topic: z.string().describe("対立している論点"),
      sideA: z.string().describe("その論点についてのA側の見方"),
      sideB: z.string().describe("その論点についてのB側の見方"),
      underlyingNeeds: z
        .string()
        .describe("対立の裏にある双方のニーズや価値観。両者を尊重する言い方で"),
    }),
  ),
  nextQuestion: z
    .string()
    .describe(
      "ファシリテーターとして今この場に投げかける問い。1文。共通点の発見やプランCの具体化に向かうもの",
    ),
  inviteToSpeak: z
    .array(z.string())
    .describe(
      "発言量が少なく、次に発言を促したい参加者の名前。いなければ空配列",
    ),
  planC: z.object({
    status: z
      .enum(["not_yet", "draft", "ready"])
      .describe(
        "not_yet: まだ材料不足 / draft: 叩き台を提示できる / ready: 双方の主要な関心を満たす案がある",
      ),
    text: z.string().describe("プランCの提案文。not_yet のときは空文字"),
    satisfiesA: z.array(z.string()).describe("この案がA側のどの関心を満たすか"),
    satisfiesB: z.array(z.string()).describe("この案がB側のどの関心を満たすか"),
    openIssues: z.array(z.string()).describe("まだ合意できていない残論点"),
  }),
});

export type FacilitationOutputSchema = z.infer<typeof facilitationOutputSchema>;

export const interviewOutputSchema = z.object({
  question: z
    .string()
    .describe(
      "参加者に次に投げかける質問。1文、日本語。done が true のときは締めの一言",
    ),
  done: z
    .boolean()
    .describe(
      "その人の意見の背景（理由・経験・大事にしている価値）が十分に聞けたら true",
    ),
});

export type InterviewOutputSchema = z.infer<typeof interviewOutputSchema>;

import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import {
  getCampaignAttributionStats,
  JST_DATE_REGEX,
} from "@/features/campaign-attribution/services/campaign-attribution-stats";
import {
  buildCampaignStatsResponse,
  DEFAULT_CAMPAIGN_STATS_LIMIT,
} from "@/features/campaign-attribution/utils/campaign-stats-response";
import { getPartyMembershipByEmail } from "@/features/party-membership/services/memberships";
import { buildMembershipLookupResponse } from "@/features/party-membership/utils/membership-lookup";
import { verifyBearerToken } from "@/lib/utils/bearer-token";
import { isValidCampaignCodeFormat } from "@/lib/validation/campaign-attribution";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * 問い合わせ対応ボット（みらいいぬ）などの外部クライアント向けMCPサーバー
 *
 * エンドポイント: /api/mcp（Streamable HTTP）
 * 認証: Authorization: Bearer ヘッダのトークンを環境変数 MCP_API_KEY と照合
 */
const handler = createMcpHandler(
  (server) => {
    server.tool(
      "get_party_membership_by_email",
      "メールアドレスをキーに、アクションボードのユーザー存在有無・党員バッジ情報・プロフィールページURLを検索する。党員バッジが表示されない等の問い合わせ対応に使う。",
      {
        email: z
          .string()
          .email()
          .describe(
            "検索対象のメールアドレス（アクションボードのログイン用メールアドレス）",
          ),
      },
      async ({ email }) => {
        const lookup = await getPartyMembershipByEmail(email);
        const response = buildMembershipLookupResponse(lookup, SITE_URL);

        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
        };
      },
    );

    server.tool(
      "get_campaign_attribution_stats",
      "キャンペーンコード（?cv=）別のアクションボード新規登録数を集計する。全国キャラバンの会場別登録数など、イベント/キャンペーン起因の成果測定（アトリビューション計測）に使う。返すのは集計値のみで個人は特定できない。",
      {
        campaignCodePrefix: z
          .string()
          .refine(isValidCampaignCodeFormat, {
            message:
              "英数字・ハイフン・アンダースコアの1〜50文字で指定してください",
          })
          .optional()
          .describe(
            "キャンペーンコードの前方一致フィルタ（例: sapporo → sapporo-0730 等が対象）。大文字小文字は区別しない。省略時は全キャンペーンを対象にする",
          ),
        from: z
          .string()
          .regex(JST_DATE_REGEX, "YYYY-MM-DD形式で指定してください")
          .optional()
          .describe("登録日の下限（JST・YYYY-MM-DD・その日を含む）"),
        to: z
          .string()
          .regex(JST_DATE_REGEX, "YYYY-MM-DD形式で指定してください")
          .optional()
          .describe("登録日の上限（JST・YYYY-MM-DD・その日を含む）"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(200)
          .optional()
          .describe(
            `返すキャンペーンコード数の上限（登録数の多い順。既定 ${DEFAULT_CAMPAIGN_STATS_LIMIT}）`,
          ),
      },
      async ({ campaignCodePrefix, from, to, limit }) => {
        const stats = await getCampaignAttributionStats({
          campaignCodePrefix,
          from,
          to,
        });
        const response = buildCampaignStatsResponse(
          stats,
          {
            campaignCodePrefix: campaignCodePrefix ?? null,
            from: from ?? null,
            to: to ?? null,
          },
          limit,
        );

        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
        };
      },
    );
  },
  {},
  {
    basePath: "/api",
    disableSse: true,
    maxDuration: 60,
  },
);

/**
 * Bearerトークンを環境変数 MCP_API_KEY と照合する
 */
function isAuthorized(request: Request): boolean {
  const expectedToken = process.env.MCP_API_KEY;
  if (!expectedToken) {
    console.error("MCP_API_KEY環境変数が設定されていません");
    return false;
  }

  return verifyBearerToken(request.headers.get("authorization"), expectedToken);
}

async function authenticatedHandler(request: Request): Promise<Response> {
  if (!isAuthorized(request)) {
    return new Response(JSON.stringify({ error: "認証に失敗しました" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return handler(request);
}

export {
  authenticatedHandler as GET,
  authenticatedHandler as POST,
  authenticatedHandler as DELETE,
};

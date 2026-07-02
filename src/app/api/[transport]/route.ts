import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { getPartyMembershipByEmail } from "@/features/party-membership/services/memberships";
import { buildMembershipLookupResponse } from "@/features/party-membership/utils/membership-lookup";
import { verifyBearerToken } from "@/lib/utils/bearer-token";

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

import { getPartyPlanConfig } from "../constants/plans";
import type { PartyMembershipLookup } from "../types";
import { isPartyBadgeVisible } from "../utils";

export type MembershipLookupResponse = {
  userExists: boolean;
  profileUrl: string | null;
  partyMembership: {
    plan: string;
    planLabel: string;
    badgeVisible: boolean;
    syncedAt: string | null;
  } | null;
  notes: string[];
};

/**
 * 党員情報検索の結果を、MCPツールのレスポンス形式に整形する
 *
 * notesには問い合わせ対応（トリアージ）に役立つ診断ヒントを含める
 */
export function buildMembershipLookupResponse(
  lookup: PartyMembershipLookup,
  siteUrl: string,
): MembershipLookupResponse {
  const { userExists, userId, membership } = lookup;

  if (!userExists || !userId) {
    return {
      userExists: false,
      profileUrl: null,
      partyMembership: null,
      notes: [
        "このメールアドレスで登録されたアクションボードユーザーが見つかりません。",
        "党員バッジを表示するには、アクションボードのログイン用メールアドレスと党員登録のメールアドレスが一致している必要があります。",
        "LINEログインでメールアドレスが連携されていないユーザーは、党員登録のメールアドレスと一致させることができません。",
      ],
    };
  }

  const profileUrl = `${siteUrl.replace(/\/$/, "")}/users/${userId}`;

  if (!membership) {
    return {
      userExists: true,
      profileUrl,
      partyMembership: null,
      notes: [
        "ユーザーは存在しますが、党員データが同期されていません。",
        "考えられる原因: (1) 党員登録のメールアドレスがアクションボードのログイン用メールアドレスと異なる、(2) 寄付（donation）のみでプラン対象外、(3) 日次同期（毎日0:30 JST実行）がまだ実行されていない。",
      ],
    };
  }

  const badgeVisible = isPartyBadgeVisible(membership);
  const planLabel = getPartyPlanConfig(membership.plan)?.label ?? "不明";

  return {
    userExists: true,
    profileUrl,
    partyMembership: {
      plan: membership.plan,
      planLabel,
      badgeVisible,
      syncedAt: membership.synced_at,
    },
    notes: badgeVisible
      ? ["党員データは同期済みで、党員バッジは表示される状態です。"]
      : [
          "党員データは同期済みですが、ユーザー自身の設定でバッジが非表示になっています。",
          "プロフィール設定ページ（/settings/profile）の「党員バッジを表示」トグルから変更できます。",
        ],
  };
}

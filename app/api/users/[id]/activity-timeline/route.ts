import { getUserActivityTimeline } from "@/lib/services/activityTimeline";
import { type NextRequest, NextResponse } from "next/server";

/**
 * ユーザー活動タイムライン取得APIエンドポイント
 *
 * このAPIエンドポイントは以下の役割を果たします：
 * - クライアントコンポーネントからserver-only関数への安全なアクセス提供
 * - クエリパラメータの適切な解析と検証
 * - エラーハンドリングとレスポンス形式の統一
 *
 * 使用場所：
 * - ユーザー詳細ページのページネーション機能
 * - クライアントサイドでの追加データ読み込み
 *
 * パラメータ：
 * - limit: 取得件数（デフォルト: 20）
 * - offset: 取得開始位置（デフォルト: 0）
 *
 * レスポンス形式：
 * - 成功時: { timeline: ActivityTimelineItem[] }
 * - エラー時: { error: string } (HTTP 500)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 20;
    const offset = Number(searchParams.get("offset")) || 0;

    const timeline = await getUserActivityTimeline(params.id, limit, offset);

    return NextResponse.json({ timeline });
  } catch (error) {
    console.error("Failed to fetch activity timeline:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity timeline" },
      { status: 500 },
    );
  }
}

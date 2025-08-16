import {
  checkBadgeNotifications,
  markBadgeNotificationAsSeen,
} from "@/lib/services/badgeNotification";
import { createClient } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createClient();

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // バッジ通知をチェック
    const notifications = await checkBadgeNotifications(user.id);

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error checking badge notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // リクエストボディからバッジIDを取得
    const { badgeIds } = await request.json();

    if (!Array.isArray(badgeIds) || badgeIds.length === 0) {
      return NextResponse.json({ error: "Invalid badge IDs" }, { status: 400 });
    }

    // バッジを通知済みにマーク
    const result = await markBadgeNotificationAsSeen(badgeIds);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to mark badges as seen" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking badge notifications as seen:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

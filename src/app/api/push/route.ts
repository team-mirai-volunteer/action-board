import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/adminClient";
import { getAuth } from "@/lib/supabase/client";

/**
 * Push通知サブスクリプションを登録する
 * POST /api/push
 */
export async function POST(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await getAuth().getUser();

    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: "サブスクリプション情報が不正です" },
        { status: 400 },
      );
    }

    const supabase = await createAdminClient();
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,endpoint" },
    );

    if (error) {
      console.error("Push subscription save error:", error);
      return NextResponse.json(
        { error: "サブスクリプションの保存に失敗しました" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push subscription error:", error);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 },
    );
  }
}

/**
 * Push通知サブスクリプションを削除する
 * DELETE /api/push
 */
export async function DELETE(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await getAuth().getUser();

    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: "エンドポイントが必要です" },
        { status: 400 },
      );
    }

    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", user.id)
      .eq("endpoint", endpoint);

    if (error) {
      console.error("Push subscription delete error:", error);
      return NextResponse.json(
        { error: "サブスクリプションの削除に失敗しました" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push subscription delete error:", error);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 },
    );
  }
}

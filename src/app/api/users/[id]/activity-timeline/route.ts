import { getUserActivityTimeline } from "@/features/user-activity/services/timeline";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 20;
    const offset = Number(searchParams.get("offset")) || 0;
    const seasonId = searchParams.get("seasonId") || undefined;

    const { id } = await params;
    const timeline = await getUserActivityTimeline(id, limit, offset, seasonId);

    return NextResponse.json({ timeline });
  } catch (error) {
    console.error("Failed to fetch activity timeline:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity timeline" },
      { status: 500 },
    );
  }
}

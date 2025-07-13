import { getUserActivityTimeline } from "@/lib/services/activityTimeline";
import { type NextRequest, NextResponse } from "next/server";

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

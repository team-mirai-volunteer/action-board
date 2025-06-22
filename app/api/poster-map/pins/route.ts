import { type NextRequest, NextResponse } from "next/server";
import { getBoardPins } from "../../../../lib/services/poster-map";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prefecture = searchParams.get("prefecture");

    if (!prefecture) {
      return NextResponse.json(
        { error: "Prefecture parameter is required" },
        { status: 400 },
      );
    }

    const pins = await getBoardPins(prefecture);
    return NextResponse.json(pins);
  } catch (error) {
    console.error("Error fetching poster pins:", error);
    return NextResponse.json(
      { error: "Failed to fetch pins" },
      { status: 500 },
    );
  }
}

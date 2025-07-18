import { getAllUsersForEndCredit } from "@/lib/services/ranking";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await getAllUsersForEndCredit();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch users for end credit:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

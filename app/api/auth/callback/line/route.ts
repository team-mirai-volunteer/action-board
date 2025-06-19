import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      return NextResponse.redirect(
        new URL("/sign-in?error=authorization_code_missing", request.url),
      );
    }

    const redirectUrl = new URL("/auth/line-callback", request.url);
    redirectUrl.searchParams.set("code", code);
    if (state) redirectUrl.searchParams.set("state", state);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    // Error handling: redirect to sign-in page with error
    return NextResponse.redirect(
      new URL("/sign-in?error=callback_failed", request.url),
    );
  }
}

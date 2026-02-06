import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { shouldShowMaintenance } from "@/lib/utils/time-check";

const MAINTENANCE_PATH = "/maintenance";
const API_PATH = "/api";
const API_PATH_PREFIX = "/api/";
const RETRY_AFTER_SECONDS = "3600";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const maintenanceEnabled = shouldShowMaintenance(request.nextUrl);

  if (maintenanceEnabled) {
    if (pathname === API_PATH || pathname.startsWith(API_PATH_PREFIX)) {
      return NextResponse.json(
        {
          error: "service_unavailable",
          message: "現在メンテナンス中です。しばらくしてからお試しください。",
        },
        {
          status: 503,
          headers: {
            "Retry-After": RETRY_AFTER_SECONDS,
            "Cache-Control": "no-store",
          },
        },
      );
    }

    if (pathname !== MAINTENANCE_PATH) {
      const maintenanceUrl = request.nextUrl.clone();
      maintenanceUrl.pathname = MAINTENANCE_PATH;
      return NextResponse.rewrite(maintenanceUrl);
    }
  } else if (pathname === MAINTENANCE_PATH) {
    const rootUrl = request.nextUrl.clone();
    rootUrl.pathname = "/";
    rootUrl.search = "";
    return NextResponse.redirect(rootUrl);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

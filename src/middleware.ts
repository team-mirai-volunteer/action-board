import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { shouldShowMaintenance } from "@/lib/utils/time-check";

const MAINTENANCE_PATH = "/maintenance";
const ROOT_PATH = "/";
const API_PATH = "/api";
const API_PATH_PREFIX = "/api/";
const RETRY_AFTER_SECONDS = "3600";

function isApiRequest(pathname: string): boolean {
  return pathname === API_PATH || pathname.startsWith(API_PATH_PREFIX);
}

function createMaintenanceApiResponse() {
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

function createMaintenanceRewriteResponse(request: NextRequest) {
  const maintenanceUrl = request.nextUrl.clone();
  maintenanceUrl.pathname = MAINTENANCE_PATH;
  return NextResponse.rewrite(maintenanceUrl);
}

function createRootRedirectResponse(request: NextRequest) {
  const rootUrl = request.nextUrl.clone();
  rootUrl.pathname = ROOT_PATH;
  rootUrl.search = "";
  return NextResponse.redirect(rootUrl);
}

function resolveMaintenanceResponse(
  request: NextRequest,
  maintenanceEnabled: boolean,
) {
  const { pathname } = request.nextUrl;

  if (maintenanceEnabled) {
    if (isApiRequest(pathname)) {
      return createMaintenanceApiResponse();
    }
    if (pathname !== MAINTENANCE_PATH) {
      return createMaintenanceRewriteResponse(request);
    }
    return null;
  }

  if (pathname === MAINTENANCE_PATH) {
    return createRootRedirectResponse(request);
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const maintenanceEnabled = shouldShowMaintenance(request.nextUrl);
  const maintenanceResponse = resolveMaintenanceResponse(
    request,
    maintenanceEnabled,
  );

  if (maintenanceResponse) {
    return maintenanceResponse;
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

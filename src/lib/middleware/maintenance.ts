import { type NextRequest, NextResponse } from "next/server";
import { shouldShowMaintenance } from "@/lib/utils/maintenance-mode";

const MAINTENANCE_PATH = "/maintenance";
const ROOT_PATH = "/";
const API_PATH = "/api";
const API_PATH_PREFIX = "/api/";
const RETRY_AFTER_SECONDS = "3600";

function isApiRequest(pathname: string): boolean {
  return pathname === API_PATH || pathname.startsWith(API_PATH_PREFIX);
}

function createMaintenanceApiResponse(): NextResponse {
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

function createMaintenanceRewriteResponse(request: NextRequest): NextResponse {
  const maintenanceUrl = request.nextUrl.clone();
  maintenanceUrl.pathname = MAINTENANCE_PATH;
  return NextResponse.rewrite(maintenanceUrl);
}

function createRootRedirectResponse(request: NextRequest): NextResponse {
  const rootUrl = request.nextUrl.clone();
  rootUrl.pathname = ROOT_PATH;
  rootUrl.search = "";
  return NextResponse.redirect(rootUrl);
}

export function resolveMaintenanceResponse(
  request: NextRequest,
): NextResponse | null {
  const { pathname } = request.nextUrl;
  const maintenanceEnabled = shouldShowMaintenance(request.nextUrl);

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

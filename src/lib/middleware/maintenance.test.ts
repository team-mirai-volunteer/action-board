/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import {
  createMaintenanceApiResponse,
  createMaintenanceRewriteResponse,
  createRootRedirectResponse,
  isApiRequest,
  resolveMaintenanceResponse,
} from "./maintenance";

jest.mock("@/lib/utils/maintenance-mode", () => ({
  shouldShowMaintenance: jest.fn(),
}));

import { shouldShowMaintenance } from "@/lib/utils/maintenance-mode";

const mockShouldShowMaintenance = shouldShowMaintenance as jest.MockedFunction<
  typeof shouldShowMaintenance
>;

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

describe("isApiRequest", () => {
  it("returns true for exact /api path", () => {
    expect(isApiRequest("/api")).toBe(true);
  });

  it("returns true for /api/ prefix paths", () => {
    expect(isApiRequest("/api/users")).toBe(true);
    expect(isApiRequest("/api/auth/callback")).toBe(true);
  });

  it("returns false for non-api paths", () => {
    expect(isApiRequest("/")).toBe(false);
    expect(isApiRequest("/missions")).toBe(false);
    expect(isApiRequest("/apikeys")).toBe(false);
  });

  it("returns false for paths that contain api but not as prefix", () => {
    expect(isApiRequest("/settings/api")).toBe(false);
  });
});

describe("createMaintenanceApiResponse", () => {
  it("returns a 503 JSON response", async () => {
    const response = createMaintenanceApiResponse();

    expect(response.status).toBe(503);

    const body = await response.json();
    expect(body.error).toBe("service_unavailable");
    expect(body.message).toBe(
      "現在メンテナンス中です。しばらくしてからお試しください。",
    );
  });

  it("includes Retry-After header", () => {
    const response = createMaintenanceApiResponse();
    expect(response.headers.get("Retry-After")).toBe("3600");
  });

  it("includes Cache-Control no-store header", () => {
    const response = createMaintenanceApiResponse();
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});

describe("createMaintenanceRewriteResponse", () => {
  it("rewrites to /maintenance path", () => {
    const request = createRequest("/missions");
    const response = createMaintenanceRewriteResponse(request);

    const rewriteUrl = response.headers.get("x-middleware-rewrite");
    expect(rewriteUrl).toContain("/maintenance");
  });

  it("preserves the host in the rewrite URL", () => {
    const request = createRequest("/some-page");
    const response = createMaintenanceRewriteResponse(request);

    const rewriteUrl = response.headers.get("x-middleware-rewrite");
    expect(rewriteUrl).toContain("localhost");
  });
});

describe("createRootRedirectResponse", () => {
  it("redirects to root path /", () => {
    const request = createRequest("/maintenance");
    const response = createRootRedirectResponse(request);

    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/");
    expect(new URL(location!).pathname).toBe("/");
  });

  it("strips search params from redirect URL", () => {
    const request = createRequest("/maintenance?preview=maintenance");
    const response = createRootRedirectResponse(request);

    const location = response.headers.get("location");
    expect(new URL(location!).search).toBe("");
  });
});

describe("resolveMaintenanceResponse", () => {
  beforeEach(() => {
    mockShouldShowMaintenance.mockReset();
  });

  describe("when maintenance is enabled", () => {
    beforeEach(() => {
      mockShouldShowMaintenance.mockReturnValue(true);
    });

    it("returns 503 JSON response for API requests", async () => {
      const request = createRequest("/api/users");
      const response = resolveMaintenanceResponse(request);

      expect(response).not.toBeNull();
      expect(response!.status).toBe(503);

      const body = await response!.json();
      expect(body.error).toBe("service_unavailable");
    });

    it("returns rewrite response for non-API, non-maintenance pages", () => {
      const request = createRequest("/missions");
      const response = resolveMaintenanceResponse(request);

      expect(response).not.toBeNull();
      const rewriteUrl = response!.headers.get("x-middleware-rewrite");
      expect(rewriteUrl).toContain("/maintenance");
    });

    it("returns null for /maintenance path (already on maintenance page)", () => {
      const request = createRequest("/maintenance");
      const response = resolveMaintenanceResponse(request);

      expect(response).toBeNull();
    });
  });

  describe("when maintenance is disabled", () => {
    beforeEach(() => {
      mockShouldShowMaintenance.mockReturnValue(false);
    });

    it("redirects /maintenance to root", () => {
      const request = createRequest("/maintenance");
      const response = resolveMaintenanceResponse(request);

      expect(response).not.toBeNull();
      expect(response!.status).toBe(307);
      const location = response!.headers.get("location");
      expect(new URL(location!).pathname).toBe("/");
    });

    it("returns null for normal pages", () => {
      const request = createRequest("/missions");
      const response = resolveMaintenanceResponse(request);

      expect(response).toBeNull();
    });

    it("returns null for API requests", () => {
      const request = createRequest("/api/users");
      const response = resolveMaintenanceResponse(request);

      expect(response).toBeNull();
    });
  });
});

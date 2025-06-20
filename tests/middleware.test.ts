import { NextRequest } from "next/server";
import { updateSession } from "../middleware";

jest.mock("./lib/supabase/middleware", () => ({
  updateSession: jest.fn(() =>
    Promise.resolve(new Response("OK", { status: 200 })),
  ),
}));

describe("Middleware", () => {
  it("ミドルウェアの正常処理", async () => {
    const request = new NextRequest("http://localhost:3000/test");
    const response = await updateSession(request);
    expect(response).toBeDefined();
    expect(response.status).toBe(200);
  });

  it("ミドルウェア認証パス処理", async () => {
    const request = new NextRequest("http://localhost:3000/auth/callback");
    const response = await updateSession(request);
    expect(response.status).toBe(200);
  });
});

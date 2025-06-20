import { NextRequest } from "next/server";
import { updateSession } from "../../../lib/supabase/middleware";

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: null } })),
    },
  })),
}));

describe("updateSession", () => {
  it("セッション更新の正常処理", async () => {
    const request = new NextRequest("http://localhost:3000/test");
    const response = await updateSession(request);
    expect(response).toBeDefined();
  });

  it("認証なしリクエストの処理", async () => {
    const request = new NextRequest("http://localhost:3000/public");
    const response = await updateSession(request);
    expect(response.status).toBe(200);
  });
});

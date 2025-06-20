import { achieveMissionAction } from "../../../../app/missions/[id]/actions";

jest.mock("../../../../lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({ data: { user: { id: "test-id" } } }),
      ),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() =>
            Promise.resolve({ data: { id: "mission-id" } }),
          ),
        })),
      })),
      insert: jest.fn(() => Promise.resolve({ error: null })),
    })),
  })),
  createServiceClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { count: 0 } })),
        })),
      })),
    })),
    rpc: jest.fn(() => Promise.resolve({ data: [], error: null })),
  })),
}));

describe("Mission Actions", () => {
  it("ミッション達成アクションの正常処理", async () => {
    const formData = new FormData();
    formData.append("missionId", "test-mission");
    const result = await achieveMissionAction(formData);
    expect(result).toBeDefined();
  });

  it("ミッション達成アクション空入力処理", async () => {
    const formData = new FormData();
    const result = await achieveMissionAction(formData);
    expect(result.error).toBeDefined();
  });
});

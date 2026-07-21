import {
  getVideoDetails,
  searchVideosByHashtag,
} from "./youtube-video-sync-service";

jest.mock("@/lib/supabase/adminClient", () => ({
  createAdminClient: jest.fn(),
}));

const mockSearchList = jest.fn();
const mockVideosList = jest.fn();

jest.mock("googleapis", () => ({
  google: {
    youtube: jest.fn(() => ({
      search: {
        list: (...args: unknown[]) => mockSearchList(...args),
      },
      videos: {
        list: (...args: unknown[]) => mockVideosList(...args),
      },
    })),
  },
}));

describe("searchVideosByHashtag", () => {
  const originalApiKey = process.env.YOUTUBE_API_KEY;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    process.env.YOUTUBE_API_KEY = "test-api-key";
    mockSearchList.mockReset();
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  afterAll(() => {
    process.env.YOUTUBE_API_KEY = originalApiKey;
  });

  it("検索結果の動画IDを返す", async () => {
    mockSearchList.mockResolvedValue({
      data: {
        items: [{ id: { videoId: "abc" } }, { id: { videoId: "def" } }],
      },
    });
    await expect(searchVideosByHashtag({ maxResults: 2 })).resolves.toEqual([
      "abc",
      "def",
    ]);
    expect(mockSearchList).toHaveBeenCalledTimes(1);
  });

  it("一時的なネットワークエラーはリトライして成功する", async () => {
    mockSearchList
      .mockRejectedValueOnce(
        new Error(
          "Invalid response body while trying to fetch https://example.com: Premature close",
        ),
      )
      .mockResolvedValue({
        data: { items: [{ id: { videoId: "abc" } }] },
      });
    await expect(searchVideosByHashtag({ maxResults: 1 })).resolves.toEqual([
      "abc",
    ]);
    expect(mockSearchList).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalled();
  });
});

describe("getVideoDetails", () => {
  const originalApiKey = process.env.YOUTUBE_API_KEY;

  beforeEach(() => {
    process.env.YOUTUBE_API_KEY = "test-api-key";
    mockVideosList.mockReset();
  });

  afterAll(() => {
    process.env.YOUTUBE_API_KEY = originalApiKey;
  });

  it("空配列のときは API を呼ばない", async () => {
    await expect(getVideoDetails([])).resolves.toEqual([]);
    expect(mockVideosList).not.toHaveBeenCalled();
  });

  it("チャンク単位で動画詳細を取得する", async () => {
    mockVideosList.mockResolvedValue({ data: { items: [{ id: "abc" }] } });
    await expect(getVideoDetails(["abc"])).resolves.toEqual([{ id: "abc" }]);
    expect(mockVideosList).toHaveBeenCalledTimes(1);
  });
});

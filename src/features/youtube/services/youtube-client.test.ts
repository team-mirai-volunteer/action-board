import {
  fetchChannelInfo,
  fetchUserLikedVideos,
  fetchUserUploadedVideos,
  fetchVideoComments,
  fetchVideoDetails,
  fetchVideoDetailsByApiKey,
  parseIdToken,
  YouTubeAPIError,
} from "./youtube-client";

describe("parseIdToken", () => {
  // Helper to create a valid JWT-like token
  function makeToken(payload: Record<string, unknown>): string {
    const header = Buffer.from(JSON.stringify({ alg: "RS256" })).toString(
      "base64url",
    );
    const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = "fake-signature";
    return `${header}.${body}.${signature}`;
  }

  it("should parse a valid id_token with all fields", () => {
    const payload = {
      iss: "https://accounts.google.com",
      sub: "1234567890",
      aud: "client-id.apps.googleusercontent.com",
      exp: 1700000000,
      iat: 1699999000,
      email: "user@example.com",
      email_verified: true,
      name: "Test User",
      picture: "https://example.com/photo.jpg",
    };

    const token = makeToken(payload);
    const result = parseIdToken(token);

    expect(result.sub).toBe("1234567890");
    expect(result.iss).toBe("https://accounts.google.com");
    expect(result.email).toBe("user@example.com");
    expect(result.name).toBe("Test User");
  });

  it("should parse a minimal valid id_token with only sub", () => {
    const payload = {
      iss: "https://accounts.google.com",
      sub: "minimal-sub",
      aud: "client-id",
      exp: 1700000000,
      iat: 1699999000,
    };

    const token = makeToken(payload);
    const result = parseIdToken(token);

    expect(result.sub).toBe("minimal-sub");
    expect(result.email).toBeUndefined();
  });

  it("should throw YouTubeAPIError for token with fewer than 3 parts", () => {
    expect(() => parseIdToken("only-one-part")).toThrow(YouTubeAPIError);
    expect(() => parseIdToken("only-one-part")).toThrow(
      "Invalid id_token format",
    );
  });

  it("should throw YouTubeAPIError for token with 2 parts", () => {
    expect(() => parseIdToken("part1.part2")).toThrow(YouTubeAPIError);
  });

  it("should throw YouTubeAPIError for empty string", () => {
    expect(() => parseIdToken("")).toThrow(YouTubeAPIError);
  });

  it("should throw YouTubeAPIError when sub claim is missing", () => {
    const payload = {
      iss: "https://accounts.google.com",
      aud: "client-id",
      exp: 1700000000,
      iat: 1699999000,
    };

    const token = makeToken(payload);
    expect(() => parseIdToken(token)).toThrow(YouTubeAPIError);
    expect(() => parseIdToken(token)).toThrow(
      "id_token does not contain sub claim",
    );
  });

  it("should throw YouTubeAPIError for malformed base64 payload", () => {
    const token = "header.!!!invalid-base64!!!.signature";
    expect(() => parseIdToken(token)).toThrow(YouTubeAPIError);
  });
});

describe("YouTube Data API fetchers", () => {
  let fetchMock: jest.Mock;
  const originalApiKey = process.env.YOUTUBE_API_KEY;

  beforeEach(() => {
    process.env.YOUTUBE_API_KEY = "test-api-key";
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterAll(() => {
    process.env.YOUTUBE_API_KEY = originalApiKey;
  });

  function jsonResponse(status: number, body: unknown) {
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
      text: async () => JSON.stringify(body),
    };
  }

  it("fetchChannelInfo はチャンネル情報を返す", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, {
        items: [
          {
            id: "ch1",
            snippet: {
              title: "t",
              description: "d",
              customUrl: "@c",
              thumbnails: { medium: { url: "https://example.com/m.jpg" } },
            },
            contentDetails: { relatedPlaylists: { uploads: "UU1" } },
          },
        ],
      }),
    );
    const channel = await fetchChannelInfo("token");
    expect(channel.id).toBe("ch1");
    expect(channel.uploadsPlaylistId).toBe("UU1");
  });

  it("fetchUserUploadedVideos はアップロード動画IDを返す", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, {
        items: [{ snippet: { resourceId: { videoId: "v1" } } }],
      }),
    );
    await expect(fetchUserUploadedVideos("token", "UU1", 1)).resolves.toEqual([
      "v1",
    ]);
  });

  it("fetchVideoDetails は動画詳細を返す", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { items: [{ id: "v1" }] }));
    await expect(fetchVideoDetails("token", ["v1"])).resolves.toEqual([
      { id: "v1" },
    ]);
  });

  it("fetchUserLikedVideos はいいねした動画を返す", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, { items: [{ id: "v1", snippet: {} }] }),
    );
    await expect(fetchUserLikedVideos("token", 1)).resolves.toHaveLength(1);
  });

  it("fetchVideoComments はコメント無効動画(403)で空配列を返す", async () => {
    fetchMock.mockResolvedValue(jsonResponse(403, { error: {} }));
    await expect(fetchVideoComments("v1", 10)).resolves.toEqual([]);
  });

  it("fetchVideoDetailsByApiKey は公開動画の詳細を返す", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { items: [{ id: "v1" }] }));
    await expect(fetchVideoDetailsByApiKey(["v1"])).resolves.toEqual([
      { id: "v1" },
    ]);
  });
});

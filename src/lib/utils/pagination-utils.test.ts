import { createPaginationUrl } from "./pagination-utils";

describe("createPaginationUrl", () => {
  it("should delete page param when page is 1", () => {
    const params = new URLSearchParams("page=3&sort=asc");
    const result = createPaginationUrl("/videos", params, 1);
    expect(result).toBe("/videos?sort=asc");
  });

  it("should set page param when page > 1", () => {
    const params = new URLSearchParams("sort=asc");
    const result = createPaginationUrl("/videos", params, 2);
    expect(result).toBe("/videos?sort=asc&page=2");
  });

  it("should preserve existing search params", () => {
    const params = new URLSearchParams("category=music&sort=desc");
    const result = createPaginationUrl("/videos", params, 3);
    expect(result).toBe("/videos?category=music&sort=desc&page=3");
  });

  it("should return pathname only when page is 1 and no other params", () => {
    const params = new URLSearchParams("page=5");
    const result = createPaginationUrl("/videos", params, 1);
    expect(result).toBe("/videos");
  });

  it("should return pathname without query when no params exist and page is 1", () => {
    const params = new URLSearchParams();
    const result = createPaginationUrl("/tiktok", params, 1);
    expect(result).toBe("/tiktok");
  });
});

import { describe, expect, it, vi } from "vitest";

// Server functions are RPC stubs at runtime; the key/param logic under test
// doesn't call them.
vi.mock("@/core/functions/platform-organizations", () => ({
  getPlatformOrganizationFn: vi.fn(),
  listPlatformOrganizationsFn: vi.fn(),
}));
vi.mock("@/core/functions/platform-users", () => ({
  getPlatformStatsFn: vi.fn(),
  listPlatformUsersFn: vi.fn(),
}));

const {
  DEFAULT_PLATFORM_LIST,
  platformKeys,
  platformOrganizationsQuery,
  platformUsersQuery,
  toListParams,
} = await import("./platform");

describe("toListParams", () => {
  it("drops an empty or whitespace search so the key matches the default", () => {
    expect(toListParams({ pageIndex: 0, pageSize: 20 }, "   ")).toEqual(
      DEFAULT_PLATFORM_LIST
    );
  });

  it("trims and keeps a real search term", () => {
    expect(toListParams({ pageIndex: 1, pageSize: 20 }, "  alice ")).toEqual({
      pageIndex: 1,
      pageSize: 20,
      search: "alice",
    });
  });
});

describe("platform query keys", () => {
  it("a loader prefetch and the first render share one cache entry", () => {
    const loaderKey = platformOrganizationsQuery(
      DEFAULT_PLATFORM_LIST
    ).queryKey;
    const componentKey = platformOrganizationsQuery(
      toListParams({ pageIndex: 0, pageSize: 20 }, "")
    ).queryKey;
    expect(componentKey).toEqual(loaderKey);
  });

  it("every key starts with the platform prefix (one invalidation refreshes all)", () => {
    const keys = [
      platformKeys.stats(),
      platformKeys.organization("o1"),
      platformOrganizationsQuery(DEFAULT_PLATFORM_LIST).queryKey,
      platformUsersQuery(DEFAULT_PLATFORM_LIST).queryKey,
    ];
    for (const key of keys) expect(key[0]).toBe(platformKeys.all[0]);
  });

  it("different searches get different cache entries", () => {
    expect(
      platformUsersQuery(toListParams({ pageIndex: 0, pageSize: 20 }, "a"))
        .queryKey
    ).not.toEqual(platformUsersQuery(DEFAULT_PLATFORM_LIST).queryKey);
  });
});

import { describe, expect, it } from "vitest";
import { resolvePostLoginPath } from "./post-login";

const member = { isPlatformAdmin: false } as const;
const admin = { isPlatformAdmin: true } as const;

describe("resolvePostLoginPath", () => {
  it("sends a member of one organization to that organization's dashboard", () => {
    expect(
      resolvePostLoginPath({
        ...member,
        redirect: undefined,
        organizationSlugs: ["acme"],
      })
    ).toBe("/acme/dashboard");
  });

  it.each([
    ["no organizations", []],
    ["several organizations", ["acme", "globex"]],
  ])("sends a member with %s to onboarding", (_label, organizationSlugs) => {
    expect(
      resolvePostLoginPath({
        ...member,
        redirect: undefined,
        organizationSlugs,
      })
    ).toBe("/onboarding");
  });

  it("sends a platform admin to the platform dashboard", () => {
    expect(
      resolvePostLoginPath({
        ...admin,
        redirect: undefined,
        organizationSlugs: ["acme"],
      })
    ).toBe("/dashboard");
  });

  it("honors a same-site redirect target", () => {
    expect(
      resolvePostLoginPath({
        ...member,
        redirect: "/acme/dashboard/settings",
        organizationSlugs: ["acme"],
      })
    ).toBe("/acme/dashboard/settings");
    expect(
      resolvePostLoginPath({
        ...admin,
        redirect: "/dashboard/users?page=2",
        organizationSlugs: [],
      })
    ).toBe("/dashboard/users?page=2");
  });

  it.each([
    "/dashboard",
    "/dashboard/",
    "/dashboard/users",
    "/Dashboard/Users",
    "/dashboard?tab=1",
    "/dashboard#top",
  ])("does not send a non-admin back to the admin-only path %s", (redirect) => {
    expect(
      resolvePostLoginPath({
        ...member,
        redirect,
        organizationSlugs: ["acme"],
      })
    ).toBe("/acme/dashboard");
    expect(
      resolvePostLoginPath({ ...member, redirect, organizationSlugs: [] })
    ).toBe("/onboarding");
  });

  it("does not mistake an organization dashboard for the admin area", () => {
    expect(
      resolvePostLoginPath({
        ...member,
        redirect: "/dashboard-team/dashboard",
        organizationSlugs: [],
      })
    ).toBe("/dashboard-team/dashboard");
  });

  it.each(["https://evil.com", "//evil.com", "/\\evil.com", undefined, 42])(
    "ignores an unsafe redirect target %s",
    (redirect) => {
      expect(
        resolvePostLoginPath({
          ...member,
          redirect,
          organizationSlugs: ["acme"],
        })
      ).toBe("/acme/dashboard");
    }
  );
});

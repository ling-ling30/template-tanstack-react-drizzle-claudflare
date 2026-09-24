import { describe, expect, it } from "vitest";
import { isSameOriginRequest } from "./same-origin";

function req(method: string, headers: Record<string, string>) {
  return new Request("https://app.example.com/_serverFn/x", {
    method,
    headers,
  });
}

describe("isSameOriginRequest", () => {
  it("always allows safe methods", () => {
    expect(
      isSameOriginRequest(req("GET", { origin: "https://evil.com" }))
    ).toBe(true);
  });

  it("allows a POST from the same host", () => {
    expect(
      isSameOriginRequest(
        req("POST", {
          host: "app.example.com",
          origin: "https://app.example.com",
        })
      )
    ).toBe(true);
  });

  it("falls back to Referer when Origin is absent", () => {
    expect(
      isSameOriginRequest(
        req("POST", {
          host: "app.example.com",
          referer: "https://app.example.com/login",
        })
      )
    ).toBe(true);
  });

  it("blocks a POST from another host", () => {
    expect(
      isSameOriginRequest(
        req("POST", { host: "app.example.com", origin: "https://evil.com" })
      )
    ).toBe(false);
  });

  it("blocks a POST with no Origin or Referer", () => {
    expect(isSameOriginRequest(req("POST", { host: "app.example.com" }))).toBe(
      false
    );
  });

  it("blocks a malformed Origin instead of throwing", () => {
    expect(
      isSameOriginRequest(
        req("POST", { host: "app.example.com", origin: "not a url" })
      )
    ).toBe(false);
  });
});

import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { logger } from "../logger/logger";

/**
 * Global CSRF and Error Pipeline Middleware
 * 
 * 1. CSRF Protection: Validates the Origin and Referer headers against the host for any state-mutating requests.
 * 2. Error Pipeline: Catches any unhandled exceptions in server functions and normalizes them
 *    into standard error responses without leaking sensitive server stack traces to the client.
 */
export const csrfAndErrorMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const request = getRequest();
  
  // 1. CSRF Protection
  if (request.method !== "GET" && request.method !== "HEAD") {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    
    // In Cloudflare Workers and standard fetch, request.url contains the full requested URL
    const url = new URL(request.url);
    const host = request.headers.get("host") || request.headers.get("x-forwarded-host") || url.host;
    
    let isValid = false;
    if (origin) {
      const originUrl = new URL(origin);
      if (originUrl.host === host) isValid = true;
    } else if (referer) {
      const refererUrl = new URL(referer);
      if (refererUrl.host === host) isValid = true;
    }
    
    if (!isValid) {
      console.warn(`[Security] CSRF Blocked: method=${request.method}, origin=${origin}, referer=${referer}, host=${host}`);
      throw new Error("CSRF check failed. Please ensure you are making requests from a valid origin.");
    }
  }

  // 2. Error Pipeline
  try {
    return await next();
  } catch (error: any) {
    logger.error("Pipeline Error", error, { url: request.url });
    // Return sanitized error directly rather than throwing to prevent leaking stack traces  
    // or unhandled promise rejections on the client.
    throw new Error("Internal Server Error", { cause: error });
  }
});

// NOTE: `csrfAndErrorMiddleware` is registered GLOBALLY in `src/start.ts` via
// `createStart({ functionMiddleware: [...] })`, so it runs on every server function
// automatically. `baseServerFn` is kept for cases where you want to compose it
// explicitly, but you no longer need to use it just to get CSRF/error handling.
export const baseServerFn = createServerFn().middleware([csrfAndErrorMiddleware]);

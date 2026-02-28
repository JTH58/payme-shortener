import { describe, it, expect } from "vitest";
import { matchRoute } from "../../src/router";

function makeRequest(method: string, path: string): Request {
  return new Request(`https://s.payme.tw${path}`, { method });
}

describe("Router", () => {
  it("GET / routes to landing", () => {
    const result = matchRoute(makeRequest("GET", "/"));
    expect(result.handler).toBe("landing");
  });

  it("POST /api/shorten routes to shorten", () => {
    const result = matchRoute(makeRequest("POST", "/api/shorten"));
    expect(result.handler).toBe("shorten");
  });

  it("GET /aBcD routes to resolve with shortCode param", () => {
    const result = matchRoute(makeRequest("GET", "/aBcD"));
    expect(result.handler).toBe("resolve");
    expect(result.params.shortCode).toBe("aBcD");
  });

  it("GET /invalid-long-path returns not-found", () => {
    const result = matchRoute(makeRequest("GET", "/toolong"));
    expect(result.handler).toBe("not-found");
  });

  it("OPTIONS /api/shorten routes to cors-preflight", () => {
    const result = matchRoute(makeRequest("OPTIONS", "/api/shorten"));
    expect(result.handler).toBe("cors-preflight");
  });

  it("POST /api/resolve routes to resolve-api", () => {
    const result = matchRoute(makeRequest("POST", "/api/resolve"));
    expect(result.handler).toBe("resolve-api");
  });

  it("OPTIONS /api/resolve routes to cors-preflight", () => {
    const result = matchRoute(makeRequest("OPTIONS", "/api/resolve"));
    expect(result.handler).toBe("cors-preflight");
  });
});

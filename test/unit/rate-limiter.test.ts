import { describe, it, expect } from "vitest";
import { env } from "cloudflare:test";
import { checkRateLimit } from "../../src/services/rate-limiter";

describe("Rate Limiter", () => {
  it("allows up to 10 requests per minute (default)", async () => {
    const ip = "test-ip-allow";
    for (let i = 0; i < 10; i++) {
      const allowed = await checkRateLimit(ip, env.SHORTENER_KV);
      expect(allowed).toBe(true);
    }
  });

  it("blocks the 11th request in the same minute (default)", async () => {
    const ip = "test-ip-block";
    for (let i = 0; i < 10; i++) {
      await checkRateLimit(ip, env.SHORTENER_KV);
    }
    const blocked = await checkRateLimit(ip, env.SHORTENER_KV);
    expect(blocked).toBe(false);
  });

  it("different IPs have independent limits", async () => {
    const ip1 = "ip-independent-1";
    const ip2 = "ip-independent-2";
    for (let i = 0; i < 10; i++) {
      await checkRateLimit(ip1, env.SHORTENER_KV);
    }
    const allowed = await checkRateLimit(ip2, env.SHORTENER_KV);
    expect(allowed).toBe(true);
  });

  it("supports custom maxRequests (100/min for resolve)", async () => {
    const ip = "test-ip-100";
    for (let i = 0; i < 100; i++) {
      const allowed = await checkRateLimit(ip, env.SHORTENER_KV, 100);
      expect(allowed).toBe(true);
    }
    const blocked = await checkRateLimit(ip, env.SHORTENER_KV, 100);
    expect(blocked).toBe(false);
  });
});

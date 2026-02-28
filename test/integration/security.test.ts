import { describe, it, expect } from "vitest";
import { SELF, env } from "cloudflare:test";

describe("Security Headers", () => {
  it("GET / includes security headers", async () => {
    const response = await SELF.fetch("https://s.payme.tw/");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(response.headers.get("Referrer-Policy")).toBe("no-referrer");
  });

  it("GET /:shortCode includes security headers", async () => {
    await env.SHORTENER_KV.put(
      "sEcR",
      JSON.stringify({ ciphertext: "ct", mode: "simple" })
    );
    const response = await SELF.fetch("https://s.payme.tw/sEcR");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(response.headers.get("Referrer-Policy")).toBe("no-referrer");
  });

  it("POST /api/shorten includes security headers", async () => {
    await env.SHORTENER_KV.put("_counter", "0");
    const response = await SELF.fetch("https://s.payme.tw/api/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://payme.tw",
        "CF-Connecting-IP": "sec-header-ip",
      },
      body: JSON.stringify({ ciphertext: "ct" }),
    });
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("POST /api/resolve includes security headers", async () => {
    const response = await SELF.fetch("https://s.payme.tw/api/resolve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CF-Connecting-IP": "sec-resolve-ip",
      },
      body: JSON.stringify({ code: "none", clientKey: "aaaa" }),
    });
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(response.headers.get("Referrer-Policy")).toBe("no-referrer");
  });
});

describe("CORS Preflight", () => {
  it("OPTIONS /api/shorten with payme.tw origin returns 204", async () => {
    const response = await SELF.fetch("https://s.payme.tw/api/shorten", {
      method: "OPTIONS",
      headers: {
        Origin: "https://payme.tw",
      },
    });
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://payme.tw"
    );
    expect(response.headers.get("Access-Control-Allow-Methods")).toContain(
      "POST"
    );
  });

  it("OPTIONS /api/shorten with evil.com origin returns 403", async () => {
    const response = await SELF.fetch("https://s.payme.tw/api/shorten", {
      method: "OPTIONS",
      headers: {
        Origin: "https://evil.com",
      },
    });
    expect(response.status).toBe(403);
  });

  it("OPTIONS /api/resolve with payme.tw origin returns 204", async () => {
    const response = await SELF.fetch("https://s.payme.tw/api/resolve", {
      method: "OPTIONS",
      headers: {
        Origin: "https://payme.tw",
      },
    });
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://payme.tw"
    );
    expect(response.headers.get("Access-Control-Allow-Methods")).toContain(
      "POST"
    );
  });

  it("OPTIONS /api/resolve with evil.com origin returns 403", async () => {
    const response = await SELF.fetch("https://s.payme.tw/api/resolve", {
      method: "OPTIONS",
      headers: {
        Origin: "https://evil.com",
      },
    });
    expect(response.status).toBe(403);
  });
});

import { describe, it, expect } from "vitest";
import { SELF, env } from "cloudflare:test";

describe("POST /api/shorten", () => {
  it("succeeds with valid origin and body, returns 4-char shortCode", async () => {
    await env.SHORTENER_KV.put("_counter", "0");

    const response = await SELF.fetch("https://s.payme.tw/api/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://payme.tw",
        "CF-Connecting-IP": "1.2.3.4",
      },
      body: JSON.stringify({
        ciphertext: "test-ciphertext-data",
      }),
    });

    expect(response.status).toBe(200);
    const json = (await response.json()) as { shortCode: string };
    expect(json.shortCode).toMatch(/^[0-9A-Za-z]{4}$/);
  });

  it("rejects non-payme.tw origin with 403", async () => {
    const response = await SELF.fetch("https://s.payme.tw/api/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://evil.com",
      },
      body: JSON.stringify({
        ciphertext: "data",
      }),
    });

    expect(response.status).toBe(403);
  });

  it("returns 429 after 10 requests from same IP", async () => {
    const ip = "rate-test-ip";
    for (let i = 0; i < 10; i++) {
      await SELF.fetch("https://s.payme.tw/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://payme.tw",
          "CF-Connecting-IP": ip,
        },
        body: JSON.stringify({
          ciphertext: `ct-${i}`,
        }),
      });
    }

    const response = await SELF.fetch("https://s.payme.tw/api/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://payme.tw",
        "CF-Connecting-IP": ip,
      },
      body: JSON.stringify({
        ciphertext: "ct-11",
      }),
    });

    expect(response.status).toBe(429);
  });

  it("writes record to KV without serverKey", async () => {
    await env.SHORTENER_KV.put("_counter", "100");

    const response = await SELF.fetch("https://s.payme.tw/api/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://payme.tw",
        "CF-Connecting-IP": "kv-test-ip",
      },
      body: JSON.stringify({
        ciphertext: "my-ciphertext",
      }),
    });

    const json = (await response.json()) as { shortCode: string };
    const stored = await env.SHORTENER_KV.get(json.shortCode);
    expect(stored).not.toBeNull();

    const record = JSON.parse(stored!);
    expect(record.ciphertext).toBe("my-ciphertext");
    expect(record).not.toHaveProperty("serverKey");
    expect(record.mode).toBe("simple");
  });

  it("stores mode=bill when specified", async () => {
    await env.SHORTENER_KV.put("_counter", "200");

    const response = await SELF.fetch("https://s.payme.tw/api/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://payme.tw",
        "CF-Connecting-IP": "mode-test-ip",
      },
      body: JSON.stringify({
        ciphertext: "bill-ct",
        mode: "bill",
      }),
    });

    const json = (await response.json()) as { shortCode: string };
    const stored = await env.SHORTENER_KV.get(json.shortCode);
    const record = JSON.parse(stored!);
    expect(record.mode).toBe("bill");
  });

  it("increments counter on each request", async () => {
    await env.SHORTENER_KV.put("_counter", "500");

    await SELF.fetch("https://s.payme.tw/api/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://payme.tw",
        "CF-Connecting-IP": "counter-test-ip",
      },
      body: JSON.stringify({ ciphertext: "ct" }),
    });

    const counter = await env.SHORTENER_KV.get("_counter");
    expect(counter).toBe("501");
  });

  it("returns 400 for missing ciphertext", async () => {
    const response = await SELF.fetch("https://s.payme.tw/api/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://payme.tw",
        "CF-Connecting-IP": "bad-body-ip",
      },
      body: JSON.stringify({ mode: "simple" }),
    });

    expect(response.status).toBe(400);
  });

  it("returns 400 for invalid JSON body", async () => {
    const response = await SELF.fetch("https://s.payme.tw/api/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://payme.tw",
        "CF-Connecting-IP": "bad-json-ip",
      },
      body: "not-json",
    });

    expect(response.status).toBe(400);
  });

  it("sets CORS header for payme.tw origin", async () => {
    await env.SHORTENER_KV.put("_counter", "0");

    const response = await SELF.fetch("https://s.payme.tw/api/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://payme.tw",
        "CF-Connecting-IP": "cors-test-ip",
      },
      body: JSON.stringify({ ciphertext: "ct" }),
    });

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://payme.tw"
    );
  });
});

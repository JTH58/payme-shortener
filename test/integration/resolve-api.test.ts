import { describe, it, expect } from "vitest";
import { SELF, env } from "cloudflare:test";
import {
  deriveEncKey,
  encryptPayload,
  generateClientKey,
} from "../../src/services/crypto";

describe("POST /api/resolve", () => {
  it("decrypts and returns URL on success", async () => {
    const clientKey = generateClientKey();
    const key = await deriveEncKey(clientKey);
    const originalUrl = "https://payme.tw/split/test?amount=100";
    const ciphertext = await encryptPayload(originalUrl, key);

    await env.SHORTENER_KV.put(
      "rApi",
      JSON.stringify({ ciphertext, mode: "simple" })
    );

    const response = await SELF.fetch("https://s.payme.tw/api/resolve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CF-Connecting-IP": "resolve-ok-ip",
      },
      body: JSON.stringify({ code: "rApi", clientKey }),
    });

    expect(response.status).toBe(200);
    const json = (await response.json()) as { url: string };
    expect(json.url).toBe(originalUrl);
  });

  it("returns 404 for expired/nonexistent shortCode", async () => {
    const response = await SELF.fetch("https://s.payme.tw/api/resolve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CF-Connecting-IP": "resolve-404-ip",
      },
      body: JSON.stringify({ code: "nope", clientKey: "aaaa" }),
    });

    expect(response.status).toBe(404);
  });

  it("returns 400 for wrong clientKey", async () => {
    const clientKey = generateClientKey();
    const key = await deriveEncKey(clientKey);
    const ciphertext = await encryptPayload("https://payme.tw/test", key);

    await env.SHORTENER_KV.put(
      "rBad",
      JSON.stringify({ ciphertext, mode: "simple" })
    );

    const response = await SELF.fetch("https://s.payme.tw/api/resolve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CF-Connecting-IP": "resolve-bad-ip",
      },
      body: JSON.stringify({ code: "rBad", clientKey: "XXXX" }),
    });

    expect(response.status).toBe(400);
  });

  it("returns 429 when rate limit exceeded (100/min)", async () => {
    const ip = "resolve-rate-ip";
    const clientKey = generateClientKey();
    const key = await deriveEncKey(clientKey);
    const ciphertext = await encryptPayload("https://payme.tw/test", key);

    await env.SHORTENER_KV.put(
      "rLim",
      JSON.stringify({ ciphertext, mode: "simple" })
    );

    for (let i = 0; i < 100; i++) {
      await SELF.fetch("https://s.payme.tw/api/resolve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CF-Connecting-IP": ip,
        },
        body: JSON.stringify({ code: "rLim", clientKey }),
      });
    }

    const response = await SELF.fetch("https://s.payme.tw/api/resolve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CF-Connecting-IP": ip,
      },
      body: JSON.stringify({ code: "rLim", clientKey }),
    });

    expect(response.status).toBe(429);
  });

  it("returns 400 for missing fields", async () => {
    const response = await SELF.fetch("https://s.payme.tw/api/resolve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CF-Connecting-IP": "resolve-missing-ip",
      },
      body: JSON.stringify({ code: "aaaa" }),
    });

    expect(response.status).toBe(400);
  });

  it("returns 400 for non-JSON body", async () => {
    const response = await SELF.fetch("https://s.payme.tw/api/resolve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CF-Connecting-IP": "resolve-nonjson-ip",
      },
      body: "not-json",
    });

    expect(response.status).toBe(400);
  });

  it("includes CORS header Access-Control-Allow-Origin: *", async () => {
    const clientKey = generateClientKey();
    const key = await deriveEncKey(clientKey);
    const ciphertext = await encryptPayload("https://payme.tw/test", key);

    await env.SHORTENER_KV.put(
      "rCor",
      JSON.stringify({ ciphertext, mode: "simple" })
    );

    const response = await SELF.fetch("https://s.payme.tw/api/resolve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CF-Connecting-IP": "resolve-cors-ip",
      },
      body: JSON.stringify({ code: "rCor", clientKey }),
    });

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });
});

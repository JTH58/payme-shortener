import { describe, it, expect } from "vitest";
import { SELF, env } from "cloudflare:test";
import {
  deriveEncKey,
  encryptPayload,
  generateClientKey,
} from "../../src/services/crypto";

describe("E2E: create -> resolve -> decrypt cycle", () => {
  it("full lifecycle works end-to-end", async () => {
    // 1. Client generates key and encrypts payload
    const clientKey = generateClientKey();
    const key = await deriveEncKey(clientKey);
    const originalUrl = "https://payme.tw/split/abc123?amount=500&name=test";
    const ciphertext = await encryptPayload(originalUrl, key);

    // 2. POST to create short link (no serverKey)
    await env.SHORTENER_KV.put("_counter", "0");

    const createResponse = await SELF.fetch(
      "https://s.payme.tw/api/shorten",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://payme.tw",
          "CF-Connecting-IP": "e2e-test-ip",
        },
        body: JSON.stringify({ ciphertext }),
      }
    );

    expect(createResponse.status).toBe(200);
    const { shortCode } = (await createResponse.json()) as {
      shortCode: string;
    };
    expect(shortCode).toMatch(/^[0-9A-Za-z]{4}$/);

    // 3. GET resolve page — should NOT contain ciphertext (no longer embedded)
    const resolveResponse = await SELF.fetch(
      `https://s.payme.tw/${shortCode}`
    );
    expect(resolveResponse.status).toBe(200);
    const html = await resolveResponse.text();
    expect(html).not.toContain(ciphertext);
    expect(html).toContain("/api/resolve");

    // 4. POST /api/resolve to decrypt server-side
    const decryptResponse = await SELF.fetch(
      "https://s.payme.tw/api/resolve",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CF-Connecting-IP": "e2e-test-ip",
        },
        body: JSON.stringify({ code: shortCode, clientKey }),
      }
    );

    expect(decryptResponse.status).toBe(200);
    const { url } = (await decryptResponse.json()) as { url: string };
    expect(url).toBe(originalUrl);
  });
});

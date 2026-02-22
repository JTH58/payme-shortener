import { describe, it, expect } from "vitest";
import { SELF, env } from "cloudflare:test";
import {
  deriveFullKey,
  encryptPayload,
  decryptPayload,
  generateServerKey,
  generateClientKey,
  base64urlEncode,
} from "../../src/services/crypto";

describe("E2E: create -> resolve -> decrypt cycle", () => {
  it("full lifecycle works end-to-end", async () => {
    // 1. Client generates keys and encrypts payload
    const clientKey = generateClientKey();
    const serverKey = generateServerKey();
    const fullKey = await deriveFullKey(clientKey, serverKey);
    const originalUrl = "https://payme.tw/split/abc123?amount=500&name=test";
    const ciphertext = await encryptPayload(originalUrl, fullKey);

    // 2. POST to create short link
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
        body: JSON.stringify({ ciphertext, serverKey }),
      }
    );

    expect(createResponse.status).toBe(200);
    const { shortCode } = (await createResponse.json()) as {
      shortCode: string;
    };
    expect(shortCode).toMatch(/^[0-9A-Za-z]{4}$/);

    // 3. GET to resolve the short link
    const resolveResponse = await SELF.fetch(
      `https://s.payme.tw/${shortCode}`
    );
    expect(resolveResponse.status).toBe(200);
    const html = await resolveResponse.text();

    // HTML should contain the ciphertext and serverKey for client-side decrypt
    expect(html).toContain(ciphertext);
    expect(html).toContain(serverKey);

    // 4. Simulate client-side decrypt
    const clientDerivedKey = await deriveFullKey(clientKey, serverKey);
    const decrypted = await decryptPayload(ciphertext, clientDerivedKey);
    expect(decrypted).toBe(originalUrl);
  });
});

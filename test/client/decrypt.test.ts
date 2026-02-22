import { describe, it, expect } from "vitest";
import {
  deriveFullKey,
  encryptPayload,
  decryptPayload,
  generateServerKey,
  generateClientKey,
} from "../../src/services/crypto";

describe("Client-side Decrypt Logic (pure function)", () => {
  it("clientDecrypt with correct key succeeds", async () => {
    const clientKey = generateClientKey();
    const serverKey = generateServerKey();
    const key = await deriveFullKey(clientKey, serverKey);

    const originalUrl = "https://payme.tw/split/test?amount=100";
    const ciphertext = await encryptPayload(originalUrl, key);

    // Simulate client-side: re-derive key and decrypt
    const clientDerivedKey = await deriveFullKey(clientKey, serverKey);
    const decrypted = await decryptPayload(ciphertext, clientDerivedKey);
    expect(decrypted).toBe(originalUrl);
  });

  it("clientDecrypt with wrong key fails", async () => {
    const clientKey = generateClientKey();
    const serverKey = generateServerKey();
    const key = await deriveFullKey(clientKey, serverKey);

    const ciphertext = await encryptPayload("https://payme.tw/test", key);

    // Wrong clientKey
    const wrongKey = await deriveFullKey("XXXX", serverKey);
    await expect(decryptPayload(ciphertext, wrongKey)).rejects.toThrow();
  });
});

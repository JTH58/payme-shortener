import { describe, it, expect } from "vitest";
import {
  deriveFullKey,
  encryptPayload,
  decryptPayload,
  generateServerKey,
  generateClientKey,
} from "../../src/services/crypto";

describe("Crypto Engine", () => {
  it("deriveFullKey produces an AES-GCM 256-bit CryptoKey", async () => {
    const serverKey = generateServerKey();
    const clientKey = generateClientKey();
    const key = await deriveFullKey(clientKey, serverKey);

    expect(key).toBeDefined();
    expect(key.algorithm).toMatchObject({ name: "AES-GCM", length: 256 });
    expect(key.usages).toContain("encrypt");
    expect(key.usages).toContain("decrypt");
  });

  it("different clientKey produces different derived key", async () => {
    const serverKey = generateServerKey();
    const key1 = await deriveFullKey("aaaa", serverKey);
    const key2 = await deriveFullKey("bbbb", serverKey);

    const raw1 = await crypto.subtle.exportKey("raw", key1);
    const raw2 = await crypto.subtle.exportKey("raw", key2);
    expect(new Uint8Array(raw1)).not.toEqual(new Uint8Array(raw2));
  });

  it("different serverKey produces different derived key", async () => {
    const serverKey1 = generateServerKey();
    const serverKey2 = generateServerKey();
    const key1 = await deriveFullKey("aaaa", serverKey1);
    const key2 = await deriveFullKey("aaaa", serverKey2);

    const raw1 = await crypto.subtle.exportKey("raw", key1);
    const raw2 = await crypto.subtle.exportKey("raw", key2);
    expect(new Uint8Array(raw1)).not.toEqual(new Uint8Array(raw2));
  });

  it("encrypt → decrypt round-trip succeeds", async () => {
    const serverKey = generateServerKey();
    const clientKey = generateClientKey();
    const key = await deriveFullKey(clientKey, serverKey);

    const plaintext = "https://payme.tw/split/abc123?amount=500";
    const ciphertext = await encryptPayload(plaintext, key);
    const decrypted = await decryptPayload(ciphertext, key);

    expect(decrypted).toBe(plaintext);
  });

  it("wrong clientKey fails to decrypt (AES-GCM tag mismatch)", async () => {
    const serverKey = generateServerKey();
    const correctKey = await deriveFullKey("Good", serverKey);
    const wrongKey = await deriveFullKey("Evil", serverKey);

    const ciphertext = await encryptPayload("secret data", correctKey);

    await expect(decryptPayload(ciphertext, wrongKey)).rejects.toThrow();
  });

  it("KV data alone cannot decrypt (zero-knowledge: missing clientKey)", async () => {
    const serverKey = generateServerKey();
    const clientKey = generateClientKey();
    const fullKey = await deriveFullKey(clientKey, serverKey);

    const ciphertext = await encryptPayload("sensitive payload", fullKey);

    // Attacker has serverKey + ciphertext but NOT clientKey
    // Try to derive key with empty clientKey
    const attackerKey = await deriveFullKey("", serverKey);
    await expect(decryptPayload(ciphertext, attackerKey)).rejects.toThrow();
  });

  it("URL data alone cannot decrypt (zero-knowledge: missing serverKey)", async () => {
    const serverKey = generateServerKey();
    const clientKey = generateClientKey();
    const fullKey = await deriveFullKey(clientKey, serverKey);

    const ciphertext = await encryptPayload("sensitive payload", fullKey);

    // Attacker has clientKey from URL but NOT serverKey
    const fakeServerKey = generateServerKey();
    const attackerKey = await deriveFullKey(clientKey, fakeServerKey);
    await expect(decryptPayload(ciphertext, attackerKey)).rejects.toThrow();
  });
});

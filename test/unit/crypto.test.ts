import { describe, it, expect } from "vitest";
import {
  deriveEncKey,
  encryptPayload,
  decryptPayload,
  generateClientKey,
} from "../../src/services/crypto";

describe("Crypto Engine", () => {
  it("deriveEncKey produces an AES-GCM 256-bit CryptoKey", async () => {
    const clientKey = generateClientKey();
    const key = await deriveEncKey(clientKey);

    expect(key).toBeDefined();
    expect(key.algorithm).toMatchObject({ name: "AES-GCM", length: 256 });
    expect(key.usages).toContain("encrypt");
    expect(key.usages).toContain("decrypt");
  });

  it("different clientKey produces different derived key", async () => {
    const key1 = await deriveEncKey("aaaa");
    const key2 = await deriveEncKey("bbbb");

    const raw1 = await crypto.subtle.exportKey("raw", key1);
    const raw2 = await crypto.subtle.exportKey("raw", key2);
    expect(new Uint8Array(raw1)).not.toEqual(new Uint8Array(raw2));
  });

  it("same clientKey produces same derived key", async () => {
    const key1 = await deriveEncKey("aaaa");
    const key2 = await deriveEncKey("aaaa");

    const raw1 = await crypto.subtle.exportKey("raw", key1);
    const raw2 = await crypto.subtle.exportKey("raw", key2);
    expect(new Uint8Array(raw1)).toEqual(new Uint8Array(raw2));
  });

  it("encrypt -> decrypt round-trip succeeds", async () => {
    const clientKey = generateClientKey();
    const key = await deriveEncKey(clientKey);

    const plaintext = "https://payme.tw/split/abc123?amount=500";
    const ciphertext = await encryptPayload(plaintext, key);
    const decrypted = await decryptPayload(ciphertext, key);

    expect(decrypted).toBe(plaintext);
  });

  it("wrong clientKey fails to decrypt (AES-GCM tag mismatch)", async () => {
    const correctKey = await deriveEncKey("Good");
    const wrongKey = await deriveEncKey("Evil");

    const ciphertext = await encryptPayload("secret data", correctKey);

    await expect(decryptPayload(ciphertext, wrongKey)).rejects.toThrow();
  });

  it("KV data alone cannot decrypt (missing clientKey)", async () => {
    const clientKey = generateClientKey();
    const key = await deriveEncKey(clientKey);

    const ciphertext = await encryptPayload("sensitive payload", key);

    // Attacker has ciphertext but NOT clientKey
    const attackerKey = await deriveEncKey("");
    await expect(decryptPayload(ciphertext, attackerKey)).rejects.toThrow();
  });
});

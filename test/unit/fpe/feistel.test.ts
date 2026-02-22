import { describe, it, expect } from "vitest";
import { feistelEncrypt, feistelDecrypt } from "../../../src/fpe/feistel";
import { DOMAIN_SIZE } from "../../../src/fpe/constants";

const TEST_KEY = "test-fpe-key-for-unit-tests-1234";

describe("Feistel FPE", () => {
  it("encrypts to a value within domain [0, 62^4)", async () => {
    const result = await feistelEncrypt(0, TEST_KEY);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(DOMAIN_SIZE);
  });

  it("encrypts different inputs to different outputs (bijection, 1000 values)", async () => {
    const results = new Set<number>();
    for (let i = 0; i < 1000; i++) {
      results.add(await feistelEncrypt(i, TEST_KEY));
    }
    expect(results.size).toBe(1000);
  });

  it("decrypts back to the original value", async () => {
    for (const input of [0, 1, 42, 999, 14_776_335]) {
      const encrypted = await feistelEncrypt(input, TEST_KEY);
      const decrypted = await feistelDecrypt(encrypted, TEST_KEY);
      expect(decrypted).toBe(input);
    }
  });

  it("produces different results with different keys", async () => {
    const result1 = await feistelEncrypt(42, TEST_KEY);
    const result2 = await feistelEncrypt(42, "different-key-here-1234567890");
    expect(result1).not.toBe(result2);
  });
});

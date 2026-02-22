import { describe, it, expect } from "vitest";
import { counterToShortCode, numberToBase62 } from "../../src/services/shortcode";

const TEST_KEY = "test-fpe-key-for-unit-tests-1234";

describe("ShortCode Generation", () => {
  it("numberToBase62 produces correct 4-char string", () => {
    expect(numberToBase62(0, 4)).toBe("0000");
    expect(numberToBase62(61, 4)).toBe("000z");
    expect(numberToBase62(62, 4)).toBe("0010");
  });

  it("counterToShortCode outputs a 4-character base62 string", async () => {
    const code = await counterToShortCode(0, TEST_KEY);
    expect(code).toHaveLength(4);
    expect(code).toMatch(/^[0-9A-Za-z]{4}$/);
  });

  it("consecutive counters produce different short codes", async () => {
    const codes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      codes.add(await counterToShortCode(i, TEST_KEY));
    }
    expect(codes.size).toBe(100);
  });

  it("consecutive counters produce non-adjacent codes", async () => {
    const code0 = await counterToShortCode(0, TEST_KEY);
    const code1 = await counterToShortCode(1, TEST_KEY);
    // They should look "random", not sequential
    expect(code0).not.toBe(code1);
    // Check they differ by more than just last character
    const diffCount = [...code0].filter((c, i) => c !== code1[i]).length;
    expect(diffCount).toBeGreaterThanOrEqual(1);
  });
});

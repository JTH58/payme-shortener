import { describe, it, expect } from "vitest";
import { SELF } from "cloudflare:test";

describe("Smoke Test", () => {
  it("GET / returns 200", async () => {
    const response = await SELF.fetch("https://s.payme.tw/");
    expect(response.status).toBe(200);
  });
});

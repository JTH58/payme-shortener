import { describe, it, expect } from "vitest";
import { SELF, env } from "cloudflare:test";

describe("GET /:shortCode (Resolve)", () => {
  it("returns 200 HTML with ciphertext and serverKey when KV has data", async () => {
    await env.SHORTENER_KV.put(
      "aBcD",
      JSON.stringify({
        ciphertext: "test-ct-data",
        serverKey: "test-sk-data",
      })
    );

    const response = await SELF.fetch("https://s.payme.tw/aBcD");
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");

    const html = await response.text();
    expect(html).toContain("test-ct-data");
    expect(html).toContain("test-sk-data");
  });

  it("returns expired page when KV returns null", async () => {
    const response = await SELF.fetch("https://s.payme.tw/xXxX");
    expect(response.status).toBe(200);

    const html = await response.text();
    expect(html).toContain("請向對方索取新連結");
    expect(html).toContain("payme.tw");
  });

  it("returns expired page for nonexistent shortCode", async () => {
    const response = await SELF.fetch("https://s.payme.tw/ZZZZ");
    const html = await response.text();
    expect(html).toContain("請向對方索取新連結");
  });

  it("resolve page HTML contains client-side decrypt script", async () => {
    await env.SHORTENER_KV.put(
      "tEsT",
      JSON.stringify({ ciphertext: "ct", serverKey: "sk" })
    );

    const response = await SELF.fetch("https://s.payme.tw/tEsT");
    const html = await response.text();
    expect(html).toContain("deriveFullKey");
    expect(html).toContain("location.hash");
  });

  it("resolve page contains incomplete-link message logic", async () => {
    await env.SHORTENER_KV.put(
      "hAsH",
      JSON.stringify({ ciphertext: "ct", serverKey: "sk" })
    );

    const response = await SELF.fetch("https://s.payme.tw/hAsH");
    const html = await response.text();
    expect(html).toContain("連結不完整");
  });

  it("resolve page shows simple OG meta by default", async () => {
    await env.SHORTENER_KV.put(
      "oGs1",
      JSON.stringify({ ciphertext: "ct", serverKey: "sk" })
    );

    const response = await SELF.fetch("https://s.payme.tw/oGs1");
    const html = await response.text();
    expect(html).toContain("PayMe.TW 收款");
    expect(html).toContain("og-simple.jpg");
  });

  it("resolve page shows bill OG meta when mode=bill", async () => {
    await env.SHORTENER_KV.put(
      "oGb1",
      JSON.stringify({ ciphertext: "ct", serverKey: "sk", mode: "bill" })
    );

    const response = await SELF.fetch("https://s.payme.tw/oGb1");
    const html = await response.text();
    expect(html).toContain("PayMe.TW 分帳");
    expect(html).toContain("og-bill.jpg");
  });

  it("resolve page contains invalid-link error message", async () => {
    await env.SHORTENER_KV.put(
      "eRrR",
      JSON.stringify({ ciphertext: "ct", serverKey: "sk" })
    );

    const response = await SELF.fetch("https://s.payme.tw/eRrR");
    const html = await response.text();
    expect(html).toContain("連結無效或已損壞");
  });
});

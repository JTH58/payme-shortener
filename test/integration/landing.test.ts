import { describe, it, expect } from "vitest";
import { SELF } from "cloudflare:test";

describe("GET / (Landing Page)", () => {
  it("returns 200 HTML with service title", async () => {
    const response = await SELF.fetch("https://s.payme.tw/");
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");

    const html = await response.text();
    expect(html).toContain("PayMe.tw 專用安全短連結");
  });

  it("contains security architecture descriptions", async () => {
    const response = await SELF.fetch("https://s.payme.tw/");
    const html = await response.text();

    expect(html).toContain("零知識");
    expect(html).toContain("雙鑰匙");
    expect(html).toContain("12 小時");
    expect(html).toContain("Hash");
    expect(html).toContain("開源");
  });

  it("contains GitHub link and payme.tw CTA button", async () => {
    const response = await SELF.fetch("https://s.payme.tw/");
    const html = await response.text();

    expect(html).toContain("github.com");
    expect(html).toContain("payme.tw");
  });
});

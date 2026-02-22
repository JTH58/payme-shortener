import { Env, ShortLinkRecord, LinkMode } from "../types";
import { counterToShortCode } from "../services/shortcode";
import { checkRateLimit } from "../services/rate-limiter";

const ALLOWED_ORIGINS = ["https://payme.tw", "https://www.payme.tw"];
const TTL_SECONDS = 43_200; // 12 hours

export async function handleShorten(
  request: Request,
  env: Env
): Promise<Response> {
  const origin = request.headers.get("Origin") || "";
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return new Response("Forbidden", { status: 403 });
  }

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const allowed = await checkRateLimit(ip, env.SHORTENER_KV);
  if (!allowed) {
    return new Response("Too Many Requests", { status: 429 });
  }

  let body: { ciphertext?: string; serverKey?: string; mode?: string };
  try {
    body = await request.json();
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  if (!body.ciphertext || !body.serverKey) {
    return new Response("Bad Request: missing ciphertext or serverKey", {
      status: 400,
    });
  }

  const mode: LinkMode = body.mode === "bill" ? "bill" : "simple";

  // Atomic counter increment
  const counterStr = await env.SHORTENER_KV.get("_counter");
  const counter = counterStr ? parseInt(counterStr, 10) : 0;
  await env.SHORTENER_KV.put("_counter", String(counter + 1));

  const shortCode = await counterToShortCode(counter, env.FPE_KEY);

  const record: ShortLinkRecord = {
    ciphertext: body.ciphertext,
    serverKey: body.serverKey,
    mode,
  };

  await env.SHORTENER_KV.put(shortCode, JSON.stringify(record), {
    expirationTtl: TTL_SECONDS,
  });

  return new Response(JSON.stringify({ shortCode }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
    },
  });
}

import { Env, ShortLinkRecord } from "../types";
import { renderResolvePage } from "../templates/resolve";
import { renderExpiredPage } from "../templates/expired";
import { deriveEncKey, decryptPayload } from "../services/crypto";
import { checkRateLimit } from "../services/rate-limiter";

export async function handleResolve(
  shortCode: string,
  env: Env
): Promise<Response> {
  const raw = await env.SHORTENER_KV.get(shortCode);

  if (!raw) {
    return new Response(renderExpiredPage(), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const record: ShortLinkRecord = JSON.parse(raw);

  return new Response(
    renderResolvePage(record.mode || "simple"),
    {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );
}

export async function handleResolveApi(
  request: Request,
  env: Env
): Promise<Response> {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const allowed = await checkRateLimit(ip, env.SHORTENER_KV, 100);
  if (!allowed) {
    return new Response("Too Many Requests", { status: 429 });
  }

  let body: { code?: string; clientKey?: string };
  try {
    body = await request.json();
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  if (!body.code || !body.clientKey) {
    return new Response("Bad Request: missing code or clientKey", {
      status: 400,
    });
  }

  const raw = await env.SHORTENER_KV.get(body.code);
  if (!raw) {
    return new Response("Not Found", { status: 404 });
  }

  const record: ShortLinkRecord = JSON.parse(raw);

  try {
    const key = await deriveEncKey(body.clientKey);
    const url = await decryptPayload(record.ciphertext, key);

    return new Response(JSON.stringify({ url }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new Response("Bad Request: decryption failed", { status: 400 });
  }
}

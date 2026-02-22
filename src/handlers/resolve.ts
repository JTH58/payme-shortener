import { Env, ShortLinkRecord } from "../types";
import { renderResolvePage } from "../templates/resolve";
import { renderExpiredPage } from "../templates/expired";

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
    renderResolvePage(record.ciphertext, record.serverKey),
    {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );
}

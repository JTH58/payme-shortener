import { Env } from "../types";

const MAX_REQUESTS = 10;

export async function checkRateLimit(
  ip: string,
  kv: KVNamespace
): Promise<boolean> {
  const minute = Math.floor(Date.now() / 60_000);
  const key = `_rate:${ip}:${minute}`;

  const current = await kv.get(key);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= MAX_REQUESTS) {
    return false;
  }

  await kv.put(key, String(count + 1), { expirationTtl: 120 });
  return true;
}

export async function checkRateLimit(
  ip: string,
  kv: KVNamespace,
  maxRequests = 10
): Promise<boolean> {
  const minute = Math.floor(Date.now() / 60_000);
  const key = `_rate:${ip}:${minute}`;

  const current = await kv.get(key);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= maxRequests) {
    return false;
  }

  await kv.put(key, String(count + 1), { expirationTtl: 120 });
  return true;
}

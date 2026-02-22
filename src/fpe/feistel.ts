import { HALF_SIZE, ROUNDS } from "./constants";

async function importKey(rawKey: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(rawKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function roundFunction(
  key: CryptoKey,
  round: number,
  value: number
): Promise<number> {
  const data = new Uint8Array(5);
  data[0] = round;
  data[1] = (value >>> 24) & 0xff;
  data[2] = (value >>> 16) & 0xff;
  data[3] = (value >>> 8) & 0xff;
  data[4] = value & 0xff;

  const sig = await crypto.subtle.sign("HMAC", key, data);
  const view = new DataView(sig);
  return view.getUint32(0) % HALF_SIZE;
}

export async function feistelEncrypt(
  plaintext: number,
  fpeKey: string
): Promise<number> {
  const key = await importKey(fpeKey);
  let L = Math.floor(plaintext / HALF_SIZE);
  let R = plaintext % HALF_SIZE;

  for (let i = 0; i < ROUNDS; i++) {
    const f = await roundFunction(key, i, R);
    const newL = R;
    const newR = (L + f) % HALF_SIZE;
    L = newL;
    R = newR;
  }

  return L * HALF_SIZE + R;
}

export async function feistelDecrypt(
  ciphertext: number,
  fpeKey: string
): Promise<number> {
  const key = await importKey(fpeKey);
  let L = Math.floor(ciphertext / HALF_SIZE);
  let R = ciphertext % HALF_SIZE;

  for (let i = ROUNDS - 1; i >= 0; i--) {
    const f = await roundFunction(key, i, L);
    const newR = L;
    const newL = (R - f + HALF_SIZE) % HALF_SIZE;
    L = newL;
    R = newR;
  }

  return L * HALF_SIZE + R;
}

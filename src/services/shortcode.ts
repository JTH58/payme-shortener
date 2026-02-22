import { BASE62_CHARSET } from "../fpe/constants";
import { feistelEncrypt } from "../fpe/feistel";

export function numberToBase62(num: number, length: number): string {
  let result = "";
  let n = num;
  for (let i = 0; i < length; i++) {
    result = BASE62_CHARSET[n % 62] + result;
    n = Math.floor(n / 62);
  }
  return result;
}

export async function counterToShortCode(
  counter: number,
  fpeKey: string
): Promise<string> {
  const encrypted = await feistelEncrypt(counter, fpeKey);
  return numberToBase62(encrypted, 4);
}

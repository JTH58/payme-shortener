export interface Env {
  SHORTENER_KV: KVNamespace;
  FPE_KEY: string;
}

export interface ShortLinkRecord {
  ciphertext: string;
  serverKey: string;
}
